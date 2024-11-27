use core::array::ArrayTrait;
use starknet::{ContractAddress, get_block_timestamp};

#[derive(Drop, Serde, Copy, starknet::Store)]
enum TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    LEND,
    BORROW,
    REPAY
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

#[derive(Drop, Serde, Copy, starknet::Store)]
struct BorrowedDetails {
    token_borrowed: ContractAddress,
    repayment_time: u64,
    interest_rate: u64,
    amount_borrowed: u256,
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
pub struct Proposal {
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
    is_repaid: bool,
    num_proposal_counters: u256
}

#[derive(Drop, Serde, Copy, starknet::Store)]
struct CounterProposal {
    id: u256,
    proposal_id: u256,
    creator: ContractAddress,
    required_collateral_value: u256,
    amount: u256,
    interest_rate: u64,
    duration: u64,
    created_at: u64,
}

#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct LiquidationThreshold {
    token: ContractAddress,
    threshold_percentage: u256,
    minimum_liquidation_amount: u256
}

#[derive(Drop, Serde, Copy)]
pub struct LiquidationInfo {
    proposal_id: u256,
    borrower: ContractAddress,
    collateral_token: ContractAddress,
    loan_token: ContractAddress,
    collateral_amount: u256,
    loan_amount: u256,
    current_ltv: u256,
    can_be_liquidated: bool
}

#[starknet::contract]
pub mod PeerProtocol {
    use starknet::event::EventEmitter;
    use super::{
        Transaction, TransactionType, UserDeposit, UserAssets, Proposal, ProposalType,
        CounterProposal, BorrowedDetails
    };
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
    use super::{LiquidationThreshold, LiquidationInfo};
    use pragma_lib::abi::{IPragmaABIDispatcher, IPragmaABIDispatcherTrait};
    use pragma_lib::types::{DataType, PragmaPricesResponse};

    #[storage]
    struct Storage {
        owner: ContractAddress,
        supported_tokens: Map<ContractAddress, bool>,
        supported_token_list: Vec<ContractAddress>,
        // Mapping: (user, token) => deposited amount
        token_deposits: Map<(ContractAddress, ContractAddress), u256>,
        user_transactions_count: Map<ContractAddress, u64>,
        user_transactions: Map<(ContractAddress, u64), Transaction>,
        borrowed_tokens: Map<ContractAddress, BorrowedDetails>,
        // Mapping: (user, token) => borrowed amount
        borrowed_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => lent amount
        lent_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => interest earned
        interests_earned: Map<(ContractAddress, ContractAddress), u256>,
        proposals: Map<u256, Proposal>, // Mapping from proposal ID to proposal details
        proposals_count: u256, // Counter for proposal IDs
        counter_proposals: Map<(u256, u256), CounterProposal>,
        protocol_fee_address: ContractAddress,
        spok_nft: ContractAddress,
        next_spok_id: u256,
        locked_collateral: Map<(ContractAddress, ContractAddress), u256>, // (user, token) => amount
        liquidation_thresholds: Map<ContractAddress, LiquidationThreshold>,
        price_oracles: Map<ContractAddress, ContractAddress>
    }

    const MAX_U64: u64 = 18446744073709551615_u64;
    const COLLATERAL_RATIO_NUMERATOR: u256 = 13_u256;
    const COLLATERAL_RATIO_DENOMINATOR: u256 = 10_u256;
    const PROTOCOL_FEE_PERCENTAGE: u256 = 1_u256; // 1%
    const ONE_E18: u256 = 1000000000000000000_u256;
    const SECONDS_IN_YEAR: u256 = 31536000_u256;

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        DepositSuccessful: DepositSuccessful,
        SupportedTokenAdded: SupportedTokenAdded,
        WithdrawalSuccessful: WithdrawalSuccessful,
        TransactionRecorded: TransactionRecorded,
        ProposalCreated: ProposalCreated,
        ProposalAccepted: ProposalAccepted,
        ProposalCountered: ProposalCountered,
        ProposalRepaid: ProposalRepaid,
        LendingProposalCreated: LendingProposalCreated
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
    pub struct LendingProposalCreated {
        pub proposal_type: ProposalType,
        pub lender: ContractAddress,
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

    #[derive(Drop, starknet::Event)]
    pub struct ProposalCountered {
        pub proposal_id: u256,
        pub creator: ContractAddress,
        pub amount: u256,
        pub interest_rate: u64,
        pub duration: u64,
        pub created_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalRepaid {
        pub proposal_type: ProposalType,
        pub repaid_by: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256
    }

    #[derive(Drop, starknet::Event)]
    pub struct LiquidationExecuted {
        pub borrower: ContractAddress,
        pub lender: ContractAddress,
        pub loan_token: ContractAddress,
        pub collateral_token: ContractAddress,
        pub loan_value: u256,
        pub collateral_value: u256,
        pub timestamp: u64
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        protocol_fee_address: ContractAddress,
        spok_nft: ContractAddress
    ) {
        assert!(owner != self.zero_address(), "zero address detected");
        self.owner.write(owner);
        self.protocol_fee_address.write(protocol_fee_address);
        self.spok_nft.write(spok_nft);
        self.proposals_count.write(0);
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
        ) -> u256 {
            assert!(self.supported_tokens.entry(token).read(), "Token not supported");
            assert!(
                self.supported_tokens.entry(accepted_collateral_token).read(),
                "Collateral token not supported"
            );
            assert!(amount > 0, "Borrow amount must be greater than zero");
            assert!(interest_rate > 0 && interest_rate <= 7, "Interest rate out of bounds");
            assert!(duration >= 7 && duration <= 15, "Duration out of bounds");

            let caller = get_caller_address();
            let created_at = get_block_timestamp();

            // Check if borrower has sufficient collateral * 1.3
            let borrower_collateral_balance = self
                .token_deposits
                .entry((caller, accepted_collateral_token))
                .read();
            assert(
                borrower_collateral_balance >= (required_collateral_value
                    * COLLATERAL_RATIO_NUMERATOR)
                    / COLLATERAL_RATIO_DENOMINATOR,
                'insufficient collateral funds'
            );

            // Lock borrowers collateral
            self
                .locked_collateral
                .entry((caller, accepted_collateral_token))
                .write(required_collateral_value);

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
                is_repaid: false,
                num_proposal_counters: 0
            };

            // Store the proposal
            self.proposals.entry(proposal_id).write(proposal);
            self.proposals_count.write(proposal_id);

            self
                .emit(
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

            proposal_id
        }

        fn get_borrow_proposal_details(self: @ContractState) -> Array<Proposal> {
            // Create an empty array to store borrow proposals
            let mut borrow_proposals: Array<Proposal> = ArrayTrait::new();

            // Get the total number of proposals
            let proposals_count = self.proposals_count.read();

            // Iterate through all proposals
            let mut i: u256 = 1;
            loop {
                // Break the loop if we've checked all proposals
                if i > proposals_count {
                    break;
                }
                // Read the proposal
                let proposal = self.proposals.entry(i).read();
                // Check if the proposal is a borrow proposal
                if proposal.proposal_type == ProposalType::BORROWING {
                    // Add to the borrow proposals array
                    borrow_proposals.append(proposal);
                }

                i += 1;
            };

            borrow_proposals
        }

        fn create_lending_proposal(
            ref self: ContractState,
            token: ContractAddress,
            accepted_collateral_token: ContractAddress,
            amount: u256,
            required_collateral_value: u256,
            interest_rate: u64,
            duration: u64,
        ) -> u256 {
            // Validation of token support
            assert!(self.supported_tokens.entry(token).read(), "Token not supported");
            assert!(
                self.supported_tokens.entry(accepted_collateral_token).read(),
                "Collateral token not supported"
            );

            // Validation of parameters
            assert!(amount > 0, "Amount must be greater than zero");
            assert!(interest_rate > 0 && interest_rate <= 7, "Interest rate out of bounds");
            assert!(duration >= 7 && duration <= 15, "Duration out of bounds");

            let caller = get_caller_address();
            let created_at = get_block_timestamp();

            let proposal_id = self.proposals_count.read() + 1;

            // Create lendingproposal
            let lending_proposal = Proposal {
                id: proposal_id,
                lender: caller,
                borrower: contract_address_const::<0>(), // zero address for unaccepted proposal
                proposal_type: ProposalType::LENDING,
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
                is_repaid: false,
                num_proposal_counters: 0
            };

            // Store proposal
            self.proposals.entry(proposal_id).write(lending_proposal);
            self.proposals_count.write(proposal_id);

            // Emit event
            self
                .emit(
                    LendingProposalCreated {
                        proposal_type: ProposalType::LENDING,
                        lender: caller,
                        token,
                        amount,
                        interest_rate,
                        duration,
                        created_at,
                    }
                );

            proposal_id
        }

        fn get_lending_proposal_details(self: @ContractState) -> Array<Proposal> {
            let mut proposals = array::ArrayTrait::new();
            let proposals_count = self.proposals_count.read();

            let mut proposal_id = 0;
            loop {
                if proposal_id >= proposals_count {
                    break;
                }

                let proposal = self.proposals.entry(proposal_id).read();
                if proposal.proposal_type == ProposalType::LENDING {
                    proposals.append(proposal);
                }

                proposal_id += 1;
            };

            proposals
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

            self
                .emit(
                    ProposalAccepted {
                        proposal_type: proposal.proposal_type,
                        accepted_by: caller,
                        token: proposal.token,
                        amount: proposal.amount
                    }
                );
        }

        fn counter_proposal(
            ref self: ContractState,
            proposal_id: u256,
            amount: u256,
            required_collateral_value: u256,
            interest_rate: u64,
            duration: u64
        ) {
            let caller = get_caller_address();
            let created_at = get_block_timestamp();
            let proposal = self.proposals.entry(proposal_id).read();

            assert!(
                proposal.proposal_type == ProposalType::LENDING, "Can only counter lending proposal"
            );

            let counter_proposal_id = proposal.num_proposal_counters + 1;

            let counter_proposal = CounterProposal {
                id: counter_proposal_id,
                creator: caller,
                proposal_id: proposal_id,
                required_collateral_value,
                amount,
                interest_rate,
                duration,
                created_at,
            };

            let mut updated_proposal = proposal;
            updated_proposal.num_proposal_counters = counter_proposal_id;

            // update the proposal
            self.proposals.entry(proposal_id).write(updated_proposal);

            // store counter proposal
            self
                .counter_proposals
                .entry((proposal_id, counter_proposal_id))
                .write(counter_proposal);

            self
                .emit(
                    ProposalCountered {
                        proposal_id, creator: caller, amount, interest_rate, duration, created_at,
                    },
                );
        }

        fn get_counter_proposals(
            self: @ContractState, proposal_id: u256
        ) -> Array<CounterProposal> {
            // Create an empty array to store counter proposals
            let mut counter_proposals: Array<CounterProposal> = ArrayTrait::new();

            // Read the proposal
            let proposal = self.proposals.entry(proposal_id).read();

            // Check if the proposal is a lend proposal
            if proposal.proposal_type == ProposalType::LENDING {
                // Iterate through all proposals
                let mut i: u256 = 1;
                loop {
                    // Break the loop if we've checked all proposals
                    if i > proposal.num_proposal_counters {
                        break;
                    }

                    // Read the counter proposal
                    let counter_proposal = self.counter_proposals.entry((proposal_id, i)).read();

                    counter_proposals.append(counter_proposal);

                    i += 1;
                };
            }

            counter_proposals
        }

        fn get_borrowed_tokens(
            self: @ContractState, user: ContractAddress
        ) -> Array<BorrowedDetails> {
            let mut borrowed_assets: Array<BorrowedDetails> = ArrayTrait::new();

            let mut i = 0;
            loop {
                // Try to read the borrowed details
                let borrowed_details = self.borrowed_tokens.entry(user).read();

                // If the entry is valid (has meaningful data), add it
                if borrowed_details.amount_borrowed > 0 {
                    borrowed_assets.append(borrowed_details);
                } else {
                    break;
                }

                i += 1;
            };

            borrowed_assets
        }

        fn repay_proposal(ref self: ContractState, proposal_id: u256) {
            let caller = get_caller_address();
            let proposal = self.proposals.entry(proposal_id).read();
            assert(caller == proposal.borrower, 'invalid borrower');
            let block_timestamp = get_block_timestamp();
            assert(block_timestamp <= proposal.repayment_date, 'repayment date overdue');

            // Calculate protocol fee
            let fee_amount = (proposal.amount * PROTOCOL_FEE_PERCENTAGE) / 100;
            let net_amount = proposal.amount - fee_amount;

            // Calculate interests
            let loan_duration: u256 = (block_timestamp - proposal.accepted_at).into();
            let interest_rate: u256 = proposal.interest_rate.into();
            let interests_amount_over_year = (net_amount * interest_rate) / 100;
            let interests_duration = loan_duration * ONE_E18 / SECONDS_IN_YEAR;
            let interests_amount_over_duration = interests_amount_over_year
                * interests_duration
                / ONE_E18;

            // Repay principal + interests
            let amount = net_amount + interests_amount_over_duration;
            let borrower_balance = IERC20Dispatcher { contract_address: proposal.token }
                .balance_of(caller);
            assert(borrower_balance >= amount, 'insufficient borrower balance');
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer_from(caller, proposal.lender, amount);

            // Unlock borrowers collateral
            let locked_collateral = self
                .locked_collateral
                .entry((caller, proposal.accepted_collateral_token))
                .read();
            self
                .locked_collateral
                .entry((caller, proposal.accepted_collateral_token))
                .write(locked_collateral - proposal.required_collateral_value);

            // Record Transaction
            self.record_transaction(proposal.token, TransactionType::REPAY, amount, caller);

            // Record interests earned
            let interests_earned = self
                .interests_earned
                .entry((proposal.lender, proposal.token))
                .read();
            self
                .interests_earned
                .entry((proposal.lender, proposal.token))
                .write(interests_earned + interests_amount_over_duration);

            // Update Proposal
            let mut updated_proposal = proposal;
            updated_proposal.is_repaid = true;
            self.proposals.entry(proposal.id).write(updated_proposal);

            self
                .emit(
                    ProposalRepaid {
                        proposal_type: proposal.proposal_type,
                        repaid_by: caller,
                        token: proposal.token,
                        amount
                    }
                );
        }

        fn check_positions_for_liquidation(
            ref self: ContractState, user: ContractAddress
        ) -> Array<LiquidationInfo> {
            let mut liquidatable_positions = ArrayTrait::new();

            let total_proposals = self.proposals_count.read();
            let mut i: u256 = 1;

            while i <= total_proposals {
                let proposal = self.proposals.entry(i).read();

                if proposal.borrower == user
                    && proposal.is_accepted == true
                    && proposal.is_repaid == false {
                    // Get current prices from oracle
                    let loan_token_price = self.get_token_price(proposal.token);
                    let collateral_token_price = self
                        .get_token_price(proposal.accepted_collateral_token);

                    // Calculate current loan value
                    let current_loan_value = proposal.amount * loan_token_price;
                    let current_collateral_value = proposal.required_collateral_value
                        * collateral_token_price;

                    // Calculate current LTV ratio
                    let current_ltv = (current_loan_value * 100) / current_collateral_value;

                    // Get liquidation threshold for this token
                    let threshold = self.liquidation_thresholds.entry(proposal.token).read();

                    let can_liquidate = current_ltv >= threshold.threshold_percentage;

                    let liquidation_info = LiquidationInfo {
                        proposal_id: proposal.id,
                        borrower: proposal.borrower,
                        collateral_token: proposal.accepted_collateral_token,
                        loan_token: proposal.token,
                        collateral_amount: proposal.required_collateral_value,
                        loan_amount: proposal.amount,
                        current_ltv: current_ltv,
                        can_be_liquidated: can_liquidate
                    };

                    if can_liquidate {
                        liquidatable_positions.append(liquidation_info);
                    }
                }

                i += 1;
            };

            liquidatable_positions
        }

        fn liquidate_position(ref self: ContractState, proposal_id: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'unauthorized liquidator');

            let proposal = self.proposals.entry(proposal_id).read();
            assert(proposal.is_accepted && !proposal.is_repaid, 'invalid proposal state');

            // Verify position is liquidatable
            let loan_token_price = self.get_token_price(proposal.token);
            let collateral_token_price = self.get_token_price(proposal.accepted_collateral_token);

            let current_loan_value = proposal.amount * loan_token_price;
            let current_collateral_value = proposal.required_collateral_value
                * collateral_token_price;
            let current_ltv = (current_loan_value * 100) / current_collateral_value;

            let threshold = self.liquidation_thresholds.entry(proposal.token).read();
            assert(current_ltv >= threshold.threshold_percentage, 'position not liquidatable');

            // Calculate liquidation amounts
            let protocol_fee = (current_loan_value * PROTOCOL_FEE_PERCENTAGE) / 100;
            let _remaining_value = current_loan_value - protocol_fee;

            // Transfer collateral to lender
            let collateral_token = IERC20Dispatcher {
                contract_address: proposal.accepted_collateral_token
            };
            collateral_token.transfer(proposal.lender, proposal.required_collateral_value);

            // Update protocol state
            self
                .locked_collateral
                .entry((proposal.borrower, proposal.accepted_collateral_token))
                .write(0);

            // Mark proposal as repaid (liquidated)
            let mut updated_proposal = proposal;
            updated_proposal.is_repaid = true;
            self.proposals.entry(proposal_id).write(updated_proposal);

            // Record liquidation transaction
            self
                .record_liquidation(
                    proposal.borrower,
                    proposal.lender,
                    proposal.token,
                    proposal.accepted_collateral_token,
                    current_loan_value,
                    proposal.required_collateral_value
                );
        }

        fn get_token_price(self: @ContractState, token: ContractAddress) -> u256 {
            let oracle = self.price_oracles.entry(token).read();
            assert(oracle != self.zero_address(), 'no oracle for token');
            let asset_id = 0;

            // Create oracle dispatcher and get price
            let oracle_dispatcher = IPragmaABIDispatcher {
                contract_address: self.price_oracles.entry(token).read()
            };
            let output: PragmaPricesResponse = oracle_dispatcher
                .get_data_median(DataType::SpotEntry(asset_id));
            assert(output.price > 0, 'invalid price returned');

            let price: u256 = (output.price).try_into().unwrap();
            price
        }


        fn record_liquidation(
            ref self: ContractState,
            borrower: ContractAddress,
            lender: ContractAddress,
            loan_token: ContractAddress,
            collateral_token: ContractAddress,
            loan_value: u256,
            collateral_value: u256
        ) {
            // Create liquidation transaction record for borrower
            let borrower_transaction = Transaction {
                transaction_type: TransactionType::WITHDRAWAL,
                token: collateral_token,
                amount: collateral_value,
                timestamp: get_block_timestamp(),
                tx_hash: get_tx_info().transaction_hash,
            };
            self._add_transaction(borrower, borrower_transaction);

            // Create liquidation transaction record for lender
            let lender_transaction = Transaction {
                transaction_type: TransactionType::DEPOSIT,
                token: collateral_token,
                amount: collateral_value,
                timestamp: get_block_timestamp(),
                tx_hash: get_tx_info().transaction_hash,
            };
            self._add_transaction(lender, lender_transaction);
            // Emit liquidation event
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

        fn handle_borrower_acceptance(
            ref self: ContractState,
            proposal: Proposal,
            lender: ContractAddress,
            net_amount: u256,
            fee_amount: u256
        ) {
            // Check if acceptor (lender) has sufficient funds
            let lender_balance = self.token_deposits.entry((lender, proposal.token)).read();
            assert(lender_balance >= proposal.amount, 'insufficient lender balance');

            // Transfer net amount to borrower
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer(proposal.borrower, net_amount);

            // Transfer protocol fee to protocol fee address
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer(self.protocol_fee_address.read(), fee_amount);

            // Mint SPOK
            // self.mint_spoks(proposal.borrower, lender);

            // Record Transaction
            self.record_transaction(proposal.token, TransactionType::LEND, proposal.amount, lender);

            // Update Proposal
            let mut updated_proposal = proposal;

            updated_proposal.lender = lender;
            updated_proposal.is_accepted = true;
            updated_proposal.accepted_at = get_block_timestamp();
            updated_proposal.repayment_date = updated_proposal.accepted_at
                + proposal.duration * 86400;

            self.proposals.entry(proposal.id).write(updated_proposal);
        }

        fn handle_lender_acceptance(
            ref self: ContractState,
            proposal: Proposal,
            borrower: ContractAddress,
            net_amount: u256,
            fee_amount: u256
        ) {
            // Check if acceptor (borrower) has sufficient collateral with 1.3x ratio
            let required_collateral = (proposal.required_collateral_value
                * COLLATERAL_RATIO_NUMERATOR)
                / COLLATERAL_RATIO_DENOMINATOR;
            let borrower_collateral_balance = self
                .token_deposits
                .entry((borrower, proposal.accepted_collateral_token))
                .read();
            assert(borrower_collateral_balance >= required_collateral, 'Insufficient collateral');

            // Lock borrowers collateral
            self
                .locked_collateral
                .entry((borrower, proposal.accepted_collateral_token))
                .write(required_collateral);

            // Transfer main amount from lender to borrower
            IERC20Dispatcher { contract_address: proposal.token }.transfer(borrower, net_amount);
            // Transfer protocol fee to protocol fee address
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer(self.protocol_fee_address.read(), fee_amount);

            // Mint SPOK
            self.mint_spoks(proposal.lender, borrower);

            // Record Transaction
            self
                .record_transaction(
                    proposal.token, TransactionType::BORROW, proposal.amount, borrower
                );

            // Update Proposal
            let mut updated_proposal = proposal;

            updated_proposal.borrower = borrower;
            updated_proposal.is_accepted = true;
            updated_proposal.accepted_at = get_block_timestamp();
            updated_proposal.repayment_date = updated_proposal.accepted_at
                + proposal.duration * 86400;

            let borrowed_token_details = BorrowedDetails {
                token_borrowed: updated_proposal.token,
                repayment_time: updated_proposal.accepted_at + proposal.duration,
                interest_rate: proposal.interest_rate,
                amount_borrowed: net_amount
            };
            self.borrowed_tokens.write(borrower, borrowed_token_details);

            self.proposals.entry(proposal.id).write(updated_proposal);
        }

        fn mint_spoks(
            ref self: ContractState, creator: ContractAddress, acceptor: ContractAddress
        ) {
            let spok = IERC721Dispatcher { contract_address: self.spok_nft.read() };

            // Mint NFTs for both parties
            let creator_token_id = self.next_spok_id.read();
            let acceptor_token_id = creator_token_id + 1;

            spok.mint(creator, creator_token_id);
            spok.mint(acceptor, acceptor_token_id);

            self.next_spok_id.write(acceptor_token_id + 1);
        }

        fn record_transaction(
            ref self: ContractState,
            token_address: ContractAddress,
            transaction_type: TransactionType,
            amount: u256,
            caller: ContractAddress
        ) {
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

