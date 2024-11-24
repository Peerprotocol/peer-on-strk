use core::array::ArrayTrait;
use starknet::{ContractAddress, get_block_timestamp};

#[derive(Drop, Serde, Copy, starknet::Store)]
enum TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    LEND,
    BORROW
}

#[derive(Drop, Serde, Copy, PartialEq, starknet::Store)]
enum ProposalType {
    BORROWING,
    LENDING
}

#[derive(Drop, Serde, Copy, starknet::Store)]
struct Transaction {
    transaction_type: TransactionType,
    token: ContractAddress,
    amount: u256,
    timestamp: u64,
    tx_hash: felt252,
}

#[derive(Drop, Serde)]
struct UserDeposit {
    token: ContractAddress,
    amount: u256,
}

#[derive(Drop, Serde)]
struct UserAssets {
    token_address: ContractAddress,
    total_lent: u256,
    total_borrowed: u256,
    interest_earned: u256,
    available_balance: u256,
}
#[derive(Drop, Serde, Copy, starknet::Store)]
struct Proposal {
    id: u256,
    lender: ContractAddress,
    borrower: ContractAddress,
    proposal_type: ProposalType,
    token: ContractAddress,
    accepted_collateral_token: ContractAddress,
    required_collateral_value: u256,
    amount: u256,
    interest_rate: u64,
    duration: u64,
    created_at: u64,
    is_accepted: bool,
    accepted_at: u64,
    repayment_date: u64,
    is_repaid: bool
}


#[starknet::contract]
mod PeerProtocol {
    use starknet::event::EventEmitter;
    use super::{Transaction, TransactionType, UserDeposit, UserAssets, Proposal, ProposalType};
    use peer_protocol::interfaces::ipeer_protocol::IPeerProtocol;
    use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use peer_protocol::interfaces::ierc721::{IERC721Dispatcher, IERC721DispatcherTrait};
    use starknet::{
        ContractAddress, get_block_timestamp, get_caller_address, get_contract_address,
        contract_address_const, get_tx_info
    };
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry, MutableVecTrait,
        Vec, VecTrait,
    };
    use core::array::ArrayTrait;
    use core::array::SpanTrait;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        supported_tokens: Map<ContractAddress, bool>,
        supported_token_list: Vec<ContractAddress>,
        // Mapping: (user, token) => deposited amount
        token_deposits: Map<(ContractAddress, ContractAddress), u256>,
        user_transactions_count: Map<ContractAddress, u64>,
        user_transactions: Map<(ContractAddress, u64), Transaction>,
        // Mapping: (user, token) => borrowed amount
        borrowed_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => lent amount
        lent_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => interest earned
        interests_earned: Map<(ContractAddress, ContractAddress), u256>,
        proposals: Map<u256, Proposal>, // Mapping from proposal ID to proposal details
        proposals_count: u256,            // Counter for proposal IDs
        protocol_fee_address: ContractAddress,
        spok_nft: ContractAddress,
        next_spok_id: u256,
        locked_collateral: Map<(ContractAddress, ContractAddress), u256>, // (user, token) => amount
    }

    const MAX_U64: u64 = 18446744073709551615_u64;
    const COLLATERAL_RATIO_NUMERATOR: u256 = 13_u256;
    const COLLATERAL_RATIO_DENOMINATOR: u256 = 10_u256;
    const PROTOCOL_FEE_PERCENTAGE: u256 = 1_u256;  // 1%

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        DepositSuccessful: DepositSuccessful,
        SupportedTokenAdded: SupportedTokenAdded,
        WithdrawalSuccessful: WithdrawalSuccessful,
        TransactionRecorded: TransactionRecorded,
        ProposalCreated: ProposalCreated,
        ProposalAccepted: ProposalAccepted
    }

    #[derive(Drop, starknet::Event)]
    pub struct DepositSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct SupportedTokenAdded {
        token: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawalSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TransactionRecorded {
        pub user: ContractAddress,
        pub transaction_type: TransactionType,
        pub token: ContractAddress,
        pub amount: u256,
        pub timestamp: u64,
        pub tx_hash: felt252,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalCreated {
        pub proposal_type: ProposalType,
        pub borrower: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
        pub interest_rate: u64,
        pub duration: u64,
        pub created_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalAccepted {
        pub proposal_type: ProposalType,
        pub accepted_by: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256
    }


    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, protocol_fee_address: ContractAddress, spok_nft: ContractAddress) {
        assert!(owner != self.zero_address(), "zero address detected");
        self.owner.write(owner);
        self.protocol_fee_address.write(protocol_fee_address);
        self.spok_nft.write(spok_nft);
    }

    #[abi(embed_v0)]
    impl PeerProtocolImpl of IPeerProtocol<ContractState> {
        fn deposit(ref self: ContractState, token_address: ContractAddress, amount: u256) {
            assert!(self.supported_tokens.entry(token_address).read(), "token not supported");
            assert!(amount > 0, "can't deposit zero value");

            let caller = get_caller_address();
            let this_contract = get_contract_address();
            let token = IERC20Dispatcher { contract_address: token_address };

            let transfer = token.transfer_from(caller, this_contract, amount);
            assert!(transfer, "transfer failed");

            let prev_deposit = self.token_deposits.entry((caller, token_address)).read();
            self.token_deposits.entry((caller, token_address)).write(prev_deposit + amount);
            
            // Record Transaction
            self.record_transaction(token_address, TransactionType::DEPOSIT, amount, caller);

            self.emit(DepositSuccessful { user: caller, token: token_address, amount: amount });
        }

        fn add_supported_token(ref self: ContractState, token_address: ContractAddress) {
            let caller = get_caller_address();

            assert!(caller == self.owner.read(), "unauthorized caller");
            assert!(
                self.supported_tokens.entry(token_address).read() == false, "token already added"
            );

            self.supported_tokens.entry(token_address).write(true);
            self.supported_token_list.append().write(token_address);

            self.emit(SupportedTokenAdded { token: token_address });
        }

        fn withdraw(ref self: ContractState, token_address: ContractAddress, amount: u256) {
            assert!(self.supported_tokens.entry(token_address).read(), "token not supported");
            assert!(amount > 0, "can't withdraw zero value");
            let caller = get_caller_address();
            let key = (caller, token_address);
            let current_balance = self.token_deposits.entry(key).read();
            assert!(amount <= current_balance, "insufficient balance");

            self.token_deposits.entry(key).write(current_balance - amount);

            let token = IERC20Dispatcher { contract_address: token_address };
            let transfer = token.transfer(caller, amount);
            assert!(transfer, "transfer failed");

            // Record Transaction
            self.record_transaction(token_address, TransactionType::WITHDRAWAL, amount, caller);

            self.emit(WithdrawalSuccessful { user: caller, token: token_address, amount: amount, });
        }

        fn create_borrow_proposal(
            ref self: ContractState,
            token: ContractAddress,
            accepted_collateral_token: ContractAddress,
            amount: u256,
            required_collateral_value: u256,
            interest_rate: u64,
            duration: u64,
        ) {
        
            assert!(self.supported_tokens.entry(token).read(), "Token not supported");
            assert!(self.supported_tokens.entry(accepted_collateral_token).read(), "Collateral token not supported");
            assert!(amount > 0, "Borrow amount must be greater than zero");
            assert!(interest_rate > 0 && interest_rate <= 7, "Interest rate out of bounds");
            assert!(duration >= 7 && duration <= 15, "Duration out of bounds");

            let caller = get_caller_address();
            let created_at = get_block_timestamp();

            // Check if borrower has sufficient collateral * 1.3
            let borrower_collateral_balance = self.token_deposits.entry((caller, accepted_collateral_token)).read();
            assert(borrower_collateral_balance >= (required_collateral_value * COLLATERAL_RATIO_NUMERATOR) / COLLATERAL_RATIO_DENOMINATOR, 'insufficient collateral funds');

            // Lock borrowers collateral
            self.locked_collateral.entry((caller, accepted_collateral_token)).write(required_collateral_value);

            let proposal_id = self.proposals_count.read() + 1;
        
            // Create a new proposal
            let proposal = Proposal {
                id: proposal_id,
                lender: self.zero_address(),
                borrower: caller,
                proposal_type: ProposalType::BORROWING,
                token,
                accepted_collateral_token,
                required_collateral_value,
                amount,
                interest_rate,
                duration,
                created_at,
                is_accepted: false,
                accepted_at: 0,
                repayment_date: 0,
                is_repaid: false
            };
        
            // Store the proposal
            self.proposals.entry(proposal_id).write(proposal);
            self.proposals_count.write(proposal_id);
        
            self.emit(
                ProposalCreated {
                    proposal_type: ProposalType::BORROWING,
                    borrower: caller,
                    token,
                    amount,
                    interest_rate,
                    duration,
                    created_at,
                },
            );
        }        

        fn get_transaction_history(
            self: @ContractState, user: ContractAddress, offset: u64, limit: u64
        ) -> Array<Transaction> {
            let mut transactions = ArrayTrait::new();
            let count = self.user_transactions_count.entry(user).read();

            // Validate offset
            assert!(offset <= count, "Invalid offset");

            // Calculate end index
            let end = if offset + limit < count {
                offset + limit
            } else {
                count
            };

            let mut i = offset;
            while i < end {
                let transaction = self.user_transactions.entry((user, i)).read();
                transactions.append(transaction);
                i += 1;
            };

            transactions
        }

        fn get_user_assets(self: @ContractState, user: ContractAddress) -> Array<UserAssets> {
            let mut user_assets: Array<UserAssets> = ArrayTrait::new();

            for i in 0
                ..self
                    .supported_token_list
                    .len() {
                        let supported_token = self.supported_token_list.at(i).read();

                        let total_deposits = self
                            .token_deposits
                            .entry((user, supported_token))
                            .read();
                        let total_borrowed = self
                            .borrowed_assets
                            .entry((user, supported_token))
                            .read();
                        let total_lent = self.lent_assets.entry((user, supported_token)).read();
                        let interest_earned = self
                            .interests_earned
                            .entry((user, supported_token))
                            .read();

                        let available_balance = if total_borrowed == 0 {
                            total_deposits
                        } else {
                            match total_deposits > total_borrowed {
                                true => total_deposits - total_borrowed,
                                false => 0
                            }
                        };

                        let token_assets = UserAssets {
                            token_address: supported_token,
                            total_lent,
                            total_borrowed,
                            interest_earned,
                            available_balance
                        };

                        if total_deposits > 0 || total_lent > 0 || total_borrowed > 0 {
                            user_assets.append(token_assets);
                        }
                    };

            user_assets
        }

        /// Returns all active deposits for a given user across supported tokens
        /// @param user The address of the user whose deposits to retrieve
        /// @return A Span of UserDeposit structs containing only tokens with non-zero balances
        ///
        /// The method:
        /// - Filters out tokens with zero balances
        /// - Returns empty span if user has no deposits
        /// - Includes token address and amount for each active deposit

        fn get_user_deposits(self: @ContractState, user: ContractAddress) -> Span<UserDeposit> {
            assert!(user != self.zero_address(), "invalid user address");

            let mut user_deposits = array![];
            for i in 0
                ..self
                    .supported_token_list
                    .len() {
                        let token = self.supported_token_list.at(i).read();
                        let deposit = self.token_deposits.entry((user, token)).read();
                        if deposit > 0 {
                            user_deposits.append(UserDeposit { token: token, amount: deposit });
                        }
                    };
            user_deposits.span()
        }

        fn accept_proposal(ref self: ContractState, proposal_id: u256) {
            let caller = get_caller_address();
            let proposal = self.proposals.entry(proposal_id).read();

            // Calculate protocol fee
            let fee_amount = (proposal.amount * PROTOCOL_FEE_PERCENTAGE) / 100;
            let net_amount = proposal.amount - fee_amount;

            match proposal.proposal_type {
                ProposalType::BORROWING => {
                    assert(caller != proposal.borrower, 'borrower not allowed');
                    self.handle_borrower_acceptance(proposal, caller, net_amount, fee_amount);
                },
                ProposalType::LENDING => {
                    assert(caller != proposal.lender, 'lender not allowed');
                    self.handle_lender_acceptance(proposal, caller, net_amount, fee_amount);
                }
            }

            self.proposals.entry(proposal_id).is_accepted.write(true);

            self.emit(ProposalAccepted {
                proposal_type: proposal.proposal_type,
                accepted_by: caller,
                token: proposal.token,
                amount: proposal.amount
            });
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _add_transaction(
            ref self: ContractState, user: ContractAddress, transaction: Transaction
        ) {
            let current_count = self.user_transactions_count.entry(user).read();
            assert!(current_count < MAX_U64, "Transaction count overflow");
            self.user_transactions.entry((user, current_count)).write(transaction);
            self.user_transactions_count.entry(user).write(current_count + 1);
        }

        fn zero_address(self: @ContractState) -> ContractAddress {
            contract_address_const::<0>()
        }

        fn handle_borrower_acceptance(ref self: ContractState, proposal: Proposal, lender: ContractAddress, net_amount: u256, fee_amount: u256) {
            // Check if acceptor (lender) has sufficient funds
            let lender_balance = self.token_deposits.entry((lender, proposal.token)).read();
            assert(lender_balance >= proposal.amount, 'insufficient lender balance');

            // Transfer net amount to borrower
            IERC20Dispatcher { contract_address: proposal.token }.transfer(proposal.borrower, net_amount);

            // Transfer protocol fee to protocol fee address
            IERC20Dispatcher { contract_address: proposal.token }.transfer(self.protocol_fee_address.read(), fee_amount);

            // Mint SPOK
            self.mint_spoks(proposal.borrower, lender);

            // Record Transaction
            self.record_transaction(proposal.token, TransactionType::LEND, proposal.amount, lender);

            // Update Proposal
            let mut updated_proposal = proposal;

            updated_proposal.lender = lender;
            updated_proposal.is_accepted = true;
            updated_proposal.accepted_at = get_block_timestamp();
            updated_proposal.repayment_date = updated_proposal.accepted_at + proposal.duration;

            self.proposals.entry(proposal.id).write(updated_proposal);
        }

        fn handle_lender_acceptance(ref self: ContractState, proposal: Proposal, borrower: ContractAddress, net_amount: u256, fee_amount: u256) {
            // Check if acceptor (borrower) has sufficient collateral with 1.3x ratio
            let required_collateral = (proposal.required_collateral_value * COLLATERAL_RATIO_NUMERATOR) / COLLATERAL_RATIO_DENOMINATOR;
            let borrower_collateral_balance = self.token_deposits.entry((borrower, proposal.accepted_collateral_token)).read();
            assert(borrower_collateral_balance >= required_collateral, 'Insufficient collateral');

            // Lock borrowers collateral
            self.locked_collateral.entry((borrower, proposal.accepted_collateral_token)).write(required_collateral);

            // Transfer main amount from lender to borrower
            IERC20Dispatcher { contract_address: proposal.token }.transfer(borrower, net_amount);
            // Transfer protocol fee to protocol fee address
            IERC20Dispatcher { contract_address: proposal.token }.transfer(self.protocol_fee_address.read(), fee_amount);

            // Mint SPOK
            self.mint_spoks(proposal.lender, borrower);

            // Record Transaction
            self.record_transaction(proposal.token, TransactionType::BORROW, proposal.amount, borrower);

            // Update Proposal
            let mut updated_proposal = proposal;

            updated_proposal.borrower = borrower;
            updated_proposal.is_accepted = true;
            updated_proposal.accepted_at = get_block_timestamp();
            updated_proposal.repayment_date = updated_proposal.accepted_at + proposal.duration;

            self.proposals.entry(proposal.id).write(updated_proposal);
        }

        fn mint_spoks(ref self: ContractState, creator: ContractAddress, acceptor: ContractAddress) {
            let spok = IERC721Dispatcher { contract_address: self.spok_nft.read() };

            // Mint NFTs for both parties
            let creator_token_id = self.next_spok_id.read();
            let acceptor_token_id = creator_token_id + 1;

            spok.mint(creator, creator_token_id);
            spok.mint(acceptor, acceptor_token_id);

            self.next_spok_id.write(acceptor_token_id + 1);
        }

        fn record_transaction(ref self: ContractState, token_address: ContractAddress, transaction_type: TransactionType, amount: u256, caller: ContractAddress) {
            // Record transaction
            let timestamp = get_block_timestamp();
            let tx_info = get_tx_info();
            let transaction = Transaction {
                transaction_type: transaction_type,
                token: token_address,
                amount,
                timestamp,
                tx_hash: tx_info.transaction_hash,
            };
            self._add_transaction(caller, transaction);

            self
                .emit(
                    TransactionRecorded {
                        user: caller,
                        transaction_type: TransactionType::WITHDRAWAL,
                        token: token_address,
                        amount,
                        timestamp,
                        tx_hash: tx_info.transaction_hash,
                    }
                );
        }
    }
}

