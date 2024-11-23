use core::array::ArrayTrait;
use starknet::{ContractAddress, get_block_timestamp};

#[derive(Drop, Serde, Copy, starknet::Store)]
enum TransactionType {
    DEPOSIT,
    WITHDRAWAL
}

#[derive(Drop, Serde, Copy, starknet::Store)]
struct Transaction {
    transaction_type: felt252,
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
struct BorrowProposal {
    borrower: ContractAddress,
    token: ContractAddress,
    amount: u256,
    interest_rate: u64,
    duration: u64,
    created_at: u64,
}

#[derive(Drop, Serde, Copy, starknet::Store)]
struct BorrowPosition {
    collateral_amount: u256,
    borrowed_amount: u256,
    collateral_symbol: felt252,
    asset_symbol: felt252,   
}


#[starknet::contract]
mod PeerProtocol {
    use super::{Transaction, TransactionType, UserDeposit, UserAssets, BorrowProposal, BorrowPosition};
    use peer_protocol::interfaces::ipeer_protocol::IPeerProtocol;
    use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
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
        borrow_proposals: Map<u64, BorrowProposal>, // Mapping from proposal ID to proposal details
        borrow_proposals_count: u64,               // Counter for proposal IDs
        //  Mapping: (user) => borrow position
        borrow_positions: Map<ContractAddress, BorrowPosition>,
    }

    const MAX_U64: u64 = 18446744073709551615_u64;

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        DepositSuccessful: DepositSuccessful,
        SupportedTokenAdded: SupportedTokenAdded,
        WithdrawalSuccessful: WithdrawalSuccessful,
        TransactionRecorded: TransactionRecorded,
        BorrowProposalCreated:BorrowProposalCreated,       
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
pub struct BorrowProposalCreated {
    pub borrower: ContractAddress,
    pub token: ContractAddress,
    pub amount: u256,
    pub interest_rate: u64,
    pub duration: u64,
    pub created_at: u64,
}


    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        assert!(owner != contract_address_const::<0>(), "zero address detected");
        self.owner.write(owner);
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

            // Record transaction
            let timestamp = get_block_timestamp();
            let tx_info = get_tx_info();
            let transaction = Transaction {
                transaction_type: 'DEPOSIT',
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
                        transaction_type: TransactionType::DEPOSIT,
                        token: token_address,
                        amount,
                        timestamp,
                        tx_hash: tx_info.transaction_hash,
                    }
                );

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

            // Record transaction
            let timestamp = get_block_timestamp();
            let tx_info = get_tx_info();
            let transaction = Transaction {
                transaction_type: 'WITHDRAWAL',
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

            self.emit(WithdrawalSuccessful { user: caller, token: token_address, amount: amount, });
        }

        fn create_borrow_proposal(
            ref self: ContractState,
            token: ContractAddress,
            amount: u256,
            interest_rate: u64,
            duration: u64,
        ) {
         
            assert!(self.supported_tokens.entry(token).read(), "Token not supported");
            assert!(amount > 0, "Borrow amount must be greater than zero");
            assert!(interest_rate > 0 && interest_rate <= 7, "Interest rate out of bounds");
            assert!(duration >= 7 && duration <= 15, "Duration out of bounds");
        
         
            let caller = get_caller_address();
            let created_at = get_block_timestamp();
        
            // Create a new proposal
            let proposal = BorrowProposal {
                borrower: caller,
                token,
                amount,
                interest_rate,
                duration,
                created_at,
            };
        
            // Store the proposal
            let proposal_id = self.borrow_proposals_count.read();
            self.borrow_proposals.entry(proposal_id).write(proposal);
            self.borrow_proposals_count.write(proposal_id + 1);
        
            self.emit(
                BorrowProposalCreated {
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
            assert!(user != contract_address_const::<0>(), "invalid user address");

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

        fn update_borrow_position(
            ref self: ContractState,
            collateral_amount: u256,
            borrowed_amount: u256,
            collateral_symbol: felt252,
            asset_symbol: felt252
            ) {
            assert!(collateral_amount > 0, "Collateral amount must be greater than zero");
            assert!(borrowed_amount > 0, "Borrow amount must be greater than zero");

            let user = get_caller_address();
            self.borrow_positions.write(user, BorrowPosition{collateral_amount, borrowed_amount, collateral_symbol, asset_symbol})
        }

        fn get_borrow_position(self: @ContractState,user: ContractAddress) -> BorrowPosition{
            self.borrow_positions.read(user)
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
    }
}

