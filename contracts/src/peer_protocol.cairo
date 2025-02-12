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

#[derive(Drop, Serde, Copy, PartialEq, Debug, starknet::Store)]
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
    released_collateral: u256,
    //amount in dollars
    amount: u256,
    //amount repaid in dollars
    amount_repaid: u256,
    //number of tokens
    token_amount: u256,
    interest_rate: u64,
    duration: u64,
    created_at: u64,
    is_accepted: bool,
    accepted_at: u64,
    repayment_date: u64,
    is_repaid: bool,
    num_proposal_counters: u256,
    is_cancelled: bool,
    borrower_nft_id: u256
}

#[derive(Drop, Serde, Copy, starknet::Store)]
struct CounterProposal {
    id: u256,
    proposal_id: u256,
    creator: ContractAddress,
    accepted_collateral_token: ContractAddress,
    required_collateral_value: u256,
    token_amount: u256,
    amount: u256,
    interest_rate: u64,
    duration: u64,
    created_at: u64,
}

#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct LiquidationThreshold {
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

#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct PoolData {
    pool_token: ContractAddress,
    is_active: bool,
    total_deposits: u256,
    total_borrowed: u256,
    total_collateral_locked: u256
}

#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct PoolRates {
    base_rate: u256,
    utilization_optimal: u256,
    slope1: u256,
    slope2: u256,
}

fn get_default_liquidation_threshold() -> LiquidationThreshold {
    LiquidationThreshold { threshold_percentage: 85, minimum_liquidation_amount: 5000 }
}

#[starknet::contract]
pub mod PeerProtocol {
    use starknet::event::EventEmitter;
    use super::{
        Transaction, TransactionType, UserDeposit, UserAssets, Proposal, ProposalType,
        CounterProposal, BorrowedDetails, PoolData, PoolRates
    };
    use peer_protocol::interfaces::ipeer_protocol::IPeerProtocol;
    use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use peer_protocol::interfaces::ipeer_spok_nft::{
        IPeerSPOKNFTDispatcher, IPeerSPOKNFTDispatcherTrait
    };

    use starknet::{
        ContractAddress, get_block_timestamp, get_caller_address, get_contract_address,
        contract_address_const, get_tx_info, ClassHash
    };
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry, MutableVecTrait,
        Vec, VecTrait,
    };
    use core::array::ArrayTrait;
    use core::array::SpanTrait;
    use core::num::traits::Zero;
    use super::{LiquidationThreshold, LiquidationInfo, get_default_liquidation_threshold};
    use pragma_lib::abi::{IPragmaABIDispatcher, IPragmaABIDispatcherTrait};
    use pragma_lib::types::{DataType, PragmaPricesResponse};
    use openzeppelin_upgrades::UpgradeableComponent;
    use openzeppelin_access::accesscontrol::AccessControlComponent;
    use openzeppelin_introspection::src5::SRC5Component;
    use alexandria_math::fast_power::fast_power;

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);


    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;

    #[abi(embed_v0)]
    impl AccessControlCamelImpl = AccessControlComponent::AccessControlCamelImpl<ContractState>;

    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

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
        pools: Map<ContractAddress, PoolData>, // erc20_token_address => pool_data
        counter_proposals: Map<(u256, u256), CounterProposal>,
        protocol_fee_address: ContractAddress,
        spok_nft: ContractAddress,
        last_spok_id: u256,
        locked_funds: Map<(ContractAddress, ContractAddress), u256>, // (user, token) => amount
        liquidation_thresholds: Map<ContractAddress, Option<LiquidationThreshold>>,
        price_oracles: Map<ContractAddress, felt252>, // Map of token and it's asset_id
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        pragma_contract: ContractAddress,
        pool_rates: Map<ContractAddress, PoolRates>,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    const MAX_U64: u64 = 18446744073709551615_u64;
    const COLLATERAL_RATIO_NUMERATOR: u256 = 13_u256;
    const COLLATERAL_RATIO_DENOMINATOR: u256 = 10_u256;
    const PROTOCOL_FEE_PERCENTAGE: u256 = 1_u256; // 1%
    const ONE_E18: u256 = 1000000000000000000_u256;
    const ONE_E8: u256 = 100000000_u256;
    const SECONDS_IN_YEAR: u256 = 31536000_u256;
    const ADMIN_ROLE: felt252 = selector!("ADMIN");
    const MAINTAINER_ROLE: felt252 = selector!("MAINTAINER");
    const SCALE: u256 = 1_000_000; // 6 decimals for percentage calculations
    const MIN_RATE: u256 = 10_000; // 0.1% minimum rate
    const MAX_RATE: u256 = 300_000_000; // 300% maximum rate
    const RATE_UPDATE_INTERVAL: u64 = 3600; // 1 hour in seconds


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
        LendingProposalCreated: LendingProposalCreated,
        ProposalCancelled: ProposalCancelled,
        PositionLiquidated: PositionLiquidated,
        PoolCreated: PoolCreated,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        RatesUpdated: RatesUpdated,
        PoolDepositSuccessful: PoolDepositSuccessful,
        PoolWithdrawalSuccessful: PoolWithdrawalSuccessful,
        PoolBorrowSuccessful: PoolBorrowSuccessful,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
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
        pub amount: u256 // in dollars
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

    #[derive(Drop, starknet::Event)]
    pub struct ProposalCancelled {
        pub caller: ContractAddress,
        pub proposal_id: u256
    }

    #[derive(Drop, starknet::Event)]
    pub struct PositionLiquidated {
        pub caller: ContractAddress,
        pub proposal_id: u256
    }

    #[derive(Drop, starknet::Event)]
    pub struct PoolCreated {
        pub created_by: ContractAddress,
        pub token: ContractAddress,
        pub created_at: u64
    }

    #[derive(Drop, starknet::Event)]
    struct RatesUpdated {
        token: ContractAddress,
        base_rate: u256,
        utilization_optimal: u256,
        slope1: u256,
        slope2: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PoolDepositSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PoolWithdrawalSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PoolBorrowSuccessful {
        pub user: ContractAddress,
        pub borrowed: ContractAddress,
        pub collateral: ContractAddress,
        pub borrowed_amount: u256,
        pub collateral_locked_amount: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        protocol_fee_address: ContractAddress,
        spok_nft: ContractAddress,
        pragma_address: ContractAddress
    ) {
        assert!(owner != self.zero_address(), "zero address detected");
        self.owner.write(owner);
        self.protocol_fee_address.write(protocol_fee_address);
        self.spok_nft.write(spok_nft);
        self.proposals_count.write(0);
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(ADMIN_ROLE, owner);
        self.pragma_contract.write(pragma_address);
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

        fn add_supported_token(
            ref self: ContractState, token_address: ContractAddress, asset_id: felt252
        ) {
            let caller = get_caller_address();

            assert!(caller == self.owner.read(), "unauthorized caller");
            assert!(
                self.supported_tokens.entry(token_address).read() == false, "token already added"
            );

            self.supported_tokens.entry(token_address).write(true);
            self.supported_token_list.append().write(token_address);
            self.price_oracles.entry(token_address).write(asset_id);

            self.emit(SupportedTokenAdded { token: token_address });
        }

        fn withdraw(ref self: ContractState, token_address: ContractAddress, amount: u256) {
            assert!(self.supported_tokens.entry(token_address).read(), "token not supported");
            assert!(amount > 0, "can't withdraw zero value");

            let caller = get_caller_address();
            let key = (caller, token_address);

            let current_balance = self.token_deposits.entry(key).read();
            let locked_funds = self.locked_funds.entry(key).read();

            let available_amount = current_balance - locked_funds;

            assert!(amount <= available_amount, "insufficient balance");

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
            amount: u256, //amount to borrow in dollars
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
            assert!(duration >= 7 && duration <= 45, "Duration out of bounds");

            let caller = get_caller_address();
            let created_at = get_block_timestamp();

            let (token_price, token_decimals) = self.get_token_price(token);
            let (collateral_token_price, collateral_decimals) = self
                .get_token_price(accepted_collateral_token);
            let token_amount = (amount * ONE_E18 * fast_power(10_u32, token_decimals).into())
                / token_price;
            let required_collateral_value: u256 = (amount
                * ONE_E18
                * fast_power(10_u32, collateral_decimals).into()
                * COLLATERAL_RATIO_NUMERATOR)
                / (collateral_token_price * COLLATERAL_RATIO_DENOMINATOR);

            // Check if borrower has sufficient collateral * 1.3
            let borrower_collateral_balance = self
                .token_deposits
                .entry((caller, accepted_collateral_token))
                .read();
            let borrower_locked_funds = self
                .locked_funds
                .entry((caller, accepted_collateral_token))
                .read();
            let available_collateral = borrower_collateral_balance - borrower_locked_funds;

            assert(
                available_collateral >= required_collateral_value, 'insufficient collateral funds'
            );

            // Lock borrowers collateral
            let prev_locked_funds = self
                .locked_funds
                .entry((caller, accepted_collateral_token))
                .read();

            self
                .locked_funds
                .entry((caller, accepted_collateral_token))
                .write(prev_locked_funds + required_collateral_value);

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
                released_collateral: 0,
                amount,
                amount_repaid: 0,
                token_amount,
                interest_rate,
                duration,
                created_at,
                is_accepted: false,
                accepted_at: 0,
                repayment_date: 0,
                is_repaid: false,
                num_proposal_counters: 0,
                is_cancelled: false,
                borrower_nft_id: 0
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
            amount: u256, //amount to lend in dollars
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
            let lender_token_balance = self.token_deposits.entry((caller, token)).read();
            let locked_funds = self.locked_funds.entry((caller, token)).read();

            let available_lending_funds = lender_token_balance - locked_funds;

            let (token_price, token_decimals) = self.get_token_price(token);
            let (collateral_token_price, collateral_decimals) = self
                .get_token_price(accepted_collateral_token);
            let token_amount = (amount * ONE_E18 * fast_power(10_u32, token_decimals).into())
                / token_price;
            let required_collateral_value: u256 = (amount
                * ONE_E18
                * fast_power(10_u32, collateral_decimals).into()
                * COLLATERAL_RATIO_NUMERATOR)
                / (collateral_token_price * COLLATERAL_RATIO_DENOMINATOR);

            // Check to ensure that lender has deposited the token they want to lend after deducting
            // the locked funds
            assert!(available_lending_funds >= token_amount, "Insufficient token balance");

            // Lock lender's funds before creating a lending proposal
            let prev_locked_funds = self.locked_funds.entry((caller, token)).read();
            self.locked_funds.entry((caller, token)).write(prev_locked_funds + token_amount);

            let created_at = get_block_timestamp();
            let proposal_id = self.proposals_count.read() + 1;

            // Create lending proposal
            let lending_proposal = Proposal {
                id: proposal_id,
                lender: caller,
                borrower: self.zero_address(), // zero address for unaccepted proposal
                proposal_type: ProposalType::LENDING,
                token,
                accepted_collateral_token,
                required_collateral_value,
                released_collateral: 0,
                //amount in dollars
                amount,
                //amount repaid in dollars
                amount_repaid: 0,
                //amount of tokens to be lent
                token_amount,
                interest_rate,
                duration,
                created_at,
                is_accepted: false,
                accepted_at: 0,
                repayment_date: 0,
                is_repaid: false,
                num_proposal_counters: 0,
                is_cancelled: false,
                borrower_nft_id: 0
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
            // Create an empty array to store borrow proposals
            let mut lending_proposals: Array<Proposal> = ArrayTrait::new();

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
                if proposal.proposal_type == ProposalType::LENDING {
                    // Add to the borrow proposals array
                    lending_proposals.append(proposal);
                }

                i += 1;
            };

            lending_proposals
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
                        let locked_funds = self.get_locked_funds(user, supported_token);

                        let available_balance = if total_borrowed == 0 {
                            total_deposits - locked_funds
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

        fn cancel_proposal(ref self: ContractState, proposal_id: u256) {
            let caller = get_caller_address();
            let proposal = self.proposals.entry(proposal_id).read();

            assert(proposal.is_accepted == false, 'proposal already accepted');
            assert(proposal.is_cancelled == false, 'proposal already cancelled');

            match proposal.proposal_type {
                ProposalType::BORROWING => {
                    assert(caller == proposal.borrower, 'unauthorized caller');
                    let borrower_locked_funds = self
                        .locked_funds
                        .entry((caller, proposal.accepted_collateral_token))
                        .read();
                    self
                        .locked_funds
                        .entry((caller, proposal.accepted_collateral_token))
                        .write(borrower_locked_funds - proposal.required_collateral_value);
                },
                ProposalType::LENDING => {
                    assert(caller == proposal.lender, 'unauthorized caller');
                    let lender_locked_funds = self
                        .locked_funds
                        .entry((caller, proposal.token))
                        .read();
                    self
                        .locked_funds
                        .entry((caller, proposal.token))
                        .write(lender_locked_funds - proposal.token_amount);
                },
            }

            self.proposals.entry(proposal_id).is_cancelled.write(true);

            self.emit(ProposalCancelled { caller, proposal_id });
        }

        fn accept_proposal(ref self: ContractState, proposal_id: u256) {
            let caller = get_caller_address();
            assert(proposal_id <= self.proposals_count.read(), 'invalid proposal id');
            let proposal = self.proposals.entry(proposal_id).read();
            assert(proposal.is_accepted == false, 'proposal already accepted');
            assert(proposal.is_cancelled == false, 'proposal is cancelled');

            // Calculate protocol fee
            let (token_price, token_decimals) = self.get_token_price(proposal.token);
            // let (collateral_token_price, _) =
            // self.get_token_price(proposal.accepted_collateral_token);

            let token_amount = (proposal.amount
                * ONE_E18
                * fast_power(10_u32, token_decimals).into())
                / token_price;
            let fee_amount = token_amount * PROTOCOL_FEE_PERCENTAGE / 100;
            let net_amount = token_amount - fee_amount;

            let proposal_type = proposal.proposal_type;
            assert(proposal_type == ProposalType::BORROWING || proposal_type == ProposalType::LENDING, 'Invalid proposal type');
            if (proposal_type == ProposalType::BORROWING){
                let locked_funds = self.locked_funds.entry((caller, proposal.token)).read();
                // lock the lenders funds

                self.locked_funds.entry((caller, proposal.token)).write(locked_funds + token_amount);
            };

            match proposal_type {
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

        fn create_counter_proposal(
            ref self: ContractState,
            proposal_id: u256,
            amount: u256,
            accepted_collateral_token: ContractAddress,
            interest_rate: u64,
            duration: u64
        ) {
            let caller = get_caller_address();
            let created_at = get_block_timestamp();
            let proposal = self.proposals.entry(proposal_id).read();

            assert(proposal.is_cancelled == false, 'proposal is cancelled');

            assert!(
                proposal.proposal_type == ProposalType::LENDING, "Can only counter lending proposal"
            );
            assert!(
                self.supported_tokens.entry(accepted_collateral_token).read(),
                "Collateral token not supported"
            );
            assert!(amount > 0, "Borrow amount must be greater than zero");
            assert!(interest_rate > 0 && interest_rate <= 7, "Interest rate out of bounds");
            assert!(duration >= 7 && duration <= 45, "Duration out of bounds");

            // Check if borrower has sufficient collateral * 1.3
            let borrower_collateral_balance = self
                .token_deposits
                .entry((caller, accepted_collateral_token))
                .read();
            let borrower_locked_funds = self
                .locked_funds
                .entry((caller, accepted_collateral_token))
                .read();

                let (token_price, token_decimals) = self.get_token_price(proposal.token);
                let (collateral_token_price, collateral_decimals) = self
                    .get_token_price(accepted_collateral_token);
                let token_amount = (amount * ONE_E18 * fast_power(10_u32, token_decimals).into())
                    / token_price;
                let required_collateral_value: u256 = (amount
                    * ONE_E18
                    * fast_power(10_u32, collateral_decimals).into()
                    * COLLATERAL_RATIO_NUMERATOR)
                    / (collateral_token_price * COLLATERAL_RATIO_DENOMINATOR);
    

            let available_collateral = borrower_collateral_balance - borrower_locked_funds;

            assert(
                available_collateral >= required_collateral_value, 'insufficient collateral funds'
            );

            // Lock borrowers collateral
            let prev_locked_funds = self
                .locked_funds
                .entry((caller, accepted_collateral_token))
                .read();

            self
                .locked_funds
                .entry((caller, accepted_collateral_token))
                .write(prev_locked_funds + required_collateral_value);

            let counter_proposal_id = proposal.num_proposal_counters + 1;

            let counter_proposal = CounterProposal {
                id: counter_proposal_id,
                creator: caller,
                accepted_collateral_token,
                proposal_id: proposal_id,
                required_collateral_value,
                token_amount,
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

        fn get_locked_funds(
            self: @ContractState, user: ContractAddress, token: ContractAddress
        ) -> u256 {
            self.locked_funds.entry((user, token)).read()
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

        // amount in dollars
        fn repay_proposal(ref self: ContractState, proposal_id: u256, amount: u256) {
            let caller = get_caller_address();
            let proposal = self.proposals.entry(proposal_id).read();
            assert(caller == proposal.borrower, 'invalid borrower');
            let block_timestamp = get_block_timestamp();
            assert(block_timestamp <= proposal.repayment_date, 'repayment date overdue');

            // Calculate repayment amount in tokens
            let (token_price, token_decimals) = self
                .get_token_price(proposal.token); // 1 Token = X USD
            let mut repayment_amount = amount;

            if repayment_amount + proposal.amount_repaid >= proposal.amount {
                repayment_amount = proposal.amount - proposal.amount_repaid;
            }
            let repayment_amount_in_tokens = (ONE_E18
                * repayment_amount
                * fast_power(10_u32, token_decimals).into())
                / token_price;

            // Calculate protocol fee
            let fee_amount_in_tokens = (repayment_amount_in_tokens * PROTOCOL_FEE_PERCENTAGE) / 100;
            let net_amount_in_tokens = repayment_amount_in_tokens - fee_amount_in_tokens;

            // Calculate interests
            let loan_duration: u256 = (block_timestamp - proposal.accepted_at).into();
            let interest_rate: u256 = proposal.interest_rate.into();
            let interests_amount_over_year = (net_amount_in_tokens * interest_rate) / 100;
            let interests_duration = loan_duration * ONE_E18 / SECONDS_IN_YEAR;
            let interests_amount_over_duration = interests_amount_over_year
                * interests_duration
                / ONE_E18;

            // Repay principal + interests
            let repayment_amount_with_interest_in_tokens = net_amount_in_tokens
                + interests_amount_over_duration;
            let borrower_balance = IERC20Dispatcher { contract_address: proposal.token }
                .balance_of(caller);
            assert(
                borrower_balance >= repayment_amount_with_interest_in_tokens,
                'insufficient borrower balance'
            );
            
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer(proposal.lender, repayment_amount_with_interest_in_tokens);

            // Calculate collateral release amount
            let (_, collateral_decimals) = self.get_token_price(proposal.accepted_collateral_token);
            let collateral = proposal.required_collateral_value;
            let repayment_percentage = (proposal.amount_repaid + repayment_amount)
                * fast_power(10_u32, collateral_decimals).into()
                / proposal.amount;
            let total_collateral_release_amount = collateral
                * repayment_percentage
                / fast_power(10_u32, collateral_decimals).into();
            let collateral_release_amount = total_collateral_release_amount
                - proposal.released_collateral;

            // Unlock borrowers collateral
            let locked_funds = self
                .locked_funds
                .entry((caller, proposal.accepted_collateral_token))
                .read();
            self
                .locked_funds
                .entry((caller, proposal.accepted_collateral_token))
                .write(locked_funds - collateral_release_amount);

            // Record Transaction
            self
                .record_transaction(
                    proposal.token, TransactionType::REPAY, repayment_amount_in_tokens, caller
                );

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
            updated_proposal.is_repaid = repayment_amount
                + proposal.amount_repaid == proposal.amount;
            updated_proposal.amount_repaid = proposal.amount_repaid + repayment_amount;
            updated_proposal.released_collateral = proposal.released_collateral
                + collateral_release_amount;
            self.proposals.entry(proposal.id).write(updated_proposal);

            if updated_proposal.is_repaid {
                let spok = IPeerSPOKNFTDispatcher { contract_address: self.spok_nft.read() };
                spok.burn(proposal.borrower_nft_id);

                // Unlock lenders locked tokens
             let locked_funds = self
             .locked_funds
             .entry((proposal.lender, proposal.token))
             .read();
         self
             .locked_funds
             .entry((proposal.lender, proposal.token))
             .write(locked_funds - proposal.token_amount);

                self
                    .emit(
                        ProposalRepaid {
                            proposal_type: proposal.proposal_type,
                            repaid_by: caller,
                            amount: proposal.amount // in dollars
                        }
                    );
            }
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
                    // Verify if this position can be liquidated.
                    let (current_ltv, can_liquidate, _) = self._verify_liquidation(@proposal);
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
            // from here
            let proposal = self.proposals.entry(proposal_id).read();
            assert(proposal.is_accepted && !proposal.is_repaid, 'invalid proposal state');

            // Verify position is liquidatable
            // current loan value is returned in the amount of tokens, not usd.
            let (_, can_liquidate, current_loan_value) = self._verify_liquidation(@proposal);
            assert(can_liquidate, 'position not liquidatable');

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
                .locked_funds
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

            self.emit(PositionLiquidated { caller, proposal_id });
        }

        fn get_token_price(self: @ContractState, token: ContractAddress) -> (u256, u32) {
            let asset_id = self.price_oracles.entry(token).read();
            assert(asset_id != 0, 'invalid token');
            let pragma_address = self.pragma_contract.read();
            // Create oracle dispatcher and get price
            let oracle_dispatcher = IPragmaABIDispatcher { contract_address: pragma_address };
            let output: PragmaPricesResponse = oracle_dispatcher
                .get_data_median(DataType::SpotEntry(asset_id));
            assert(output.price > 0, 'invalid price returned');
            (output.price.into(), output.decimals)
        }

        fn deploy_liquidity_pool(
            ref self: ContractState,
            token: ContractAddress,
            opt_threshold_percentage: Option<u256>,
            opt_minimum_liquidation_amount: Option<u256>
        ) {
            let caller = get_caller_address();
            self
                ._deploy_liquidity_pool(
                    token, caller, opt_threshold_percentage, opt_minimum_liquidation_amount
                );

            self
                .emit(
                    PoolCreated {
                        created_by: caller, token: token, created_at: get_block_timestamp()
                    }
                );
        }

        fn get_liquidity_pool_data(self: @ContractState, token: ContractAddress) -> PoolData {
            self.pools.entry(token).read()
        }

        fn calculate_rates(
            self: @ContractState, token: ContractAddress, total_borrows: u256, total_deposits: u256
        ) -> (u256, u256) {
            // prevent division by zero
            if total_deposits == 0 {
                return (MIN_RATE, MIN_RATE);
            }

            // calculate utilization rate
            let utilization = (total_borrows * SCALE) / total_deposits;

            // get pool parameters
            let rates = self.pool_rates.read(token);

            // calculate borrow rate based on utilization
            let borrow_rate = if utilization <= rates.utilization_optimal {
                // before kink: Rb = Rbase + U × Rslope1
                rates.base_rate + (utilization * rates.slope1) / SCALE
            } else {
                // after kink: Rb = Rbase + Ukink × Rslope1 + (U - Ukink) × Rslope2
                let excess_util = utilization - rates.utilization_optimal;
                rates.base_rate
                    + (rates.utilization_optimal * rates.slope1) / SCALE
                    + (excess_util * rates.slope2) / SCALE
            };

            // apply min/max bounds to borrow rate
            let bounded_borrow_rate = if borrow_rate < MIN_RATE {
                MIN_RATE
            } else if borrow_rate > MAX_RATE {
                MAX_RATE
            } else {
                borrow_rate
            };

            // calculate lending rate with reserve factor
            // Rl = U × Rb × (1 - reserve_factor)
            let reserve_factor = PROTOCOL_FEE_PERCENTAGE; // Using existing 1% protocol fee
            let lending_rate = (bounded_borrow_rate * utilization * (100 - reserve_factor))
                / (SCALE * 100);

            let bounded_lending_rate = if lending_rate < MIN_RATE {
                MIN_RATE
            } else if lending_rate > MAX_RATE {
                MAX_RATE
            } else {
                lending_rate
            };

            (bounded_lending_rate, bounded_borrow_rate)
        }

        fn update_pool_rates(
            ref self: ContractState,
            token: ContractAddress,
            base_rate: u256,
            utilization_optimal: u256,
            slope1: u256,
            slope2: u256
        ) {
            // validate parameters
            assert(utilization_optimal <= SCALE, 'Utilization must be <= 100%');
            assert(base_rate <= MAX_RATE, 'Base rate too high');

            self
                .pool_rates
                .entry(token)
                .write(PoolRates { base_rate, utilization_optimal, slope1, slope2 });

            self.emit(RatesUpdated { token, base_rate, utilization_optimal, slope1, slope2 });
        }

        fn get_pool_rates(self: @ContractState, token: ContractAddress) -> PoolRates {
            self.pool_rates.entry(token).read()
        }

        fn deposit_to_pool(ref self: ContractState, token: ContractAddress, amount: u256) {
            let pool_data = self.pools.entry(token);

            assert!(pool_data.is_active.read(), "Pool is not active");

            self.deposit(token, amount);

            // Update the pool's total deposited amount
            let updated_deposit = pool_data.total_deposits.read() + amount;
            pool_data.total_deposits.write(updated_deposit);

            self
                .emit(
                    PoolDepositSuccessful {
                        user: get_caller_address(), token: token, amount: amount
                    }
                );
        }

        fn withdraw_from_pool(ref self: ContractState, token: ContractAddress, amount: u256) {
            let pool_data = self.pools.entry(token);

            assert!(pool_data.is_active.read(), "Pool is not active");

            // Calculate how much of the pool's liquidity is currently available
            let total_deposit = pool_data.total_deposits.read();
            let total_borrowed = pool_data.total_borrowed.read();
            let available_liquidity = total_deposit - total_borrowed;

            // Prevent withdrawal if the amount exceeds the pool's available liquidity
            assert!(
                available_liquidity >= amount,
                "Requested withdrawal exceeds available pool liquidity"
            );

            self.withdraw(token, amount);

            // Update the pool's total deposited amount
            pool_data.total_deposits.write(total_deposit - amount);

            self
                .emit(
                    PoolWithdrawalSuccessful {
                        user: get_caller_address(), token: token, amount: amount
                    }
                );
        }

        fn borrow_from_pool(
            ref self: ContractState,
            token: ContractAddress,
            collateral: ContractAddress,
            amount: u256
        ) {
            assert!(amount > 0, "Borrow amount must be greater than zero");

            let token_pool = self.pools.entry(token);
            let collateral_pool = self.pools.entry(collateral);

            assert!(token_pool.is_active.read(), "Borrowed token pool is not active");
            assert!(collateral_pool.is_active.read(), "Collateral token pool is not active");

            let (token_price, token_decimals) = self.get_token_price(token);
            let (collateral_token_price, collateral_token_decimals) = self
                .get_token_price(collateral);

            // Convert USD amount to token units
            let token_amount = (amount * ONE_E18 * fast_power(10_u32, token_decimals).into())
                / token_price;

            // Calculate required collateral
            let required_collateral_value = (amount
                * ONE_E18
                * fast_power(10_u32, collateral_token_decimals).into()
                * COLLATERAL_RATIO_NUMERATOR)
                / (collateral_token_price * COLLATERAL_RATIO_DENOMINATOR);

            // Ensure pool has sufficient liquidity
            let pool_deposit = token_pool.total_deposits.read();
            let pool_borrowed = token_pool.total_borrowed.read();
            let available_liquidity = pool_deposit - pool_borrowed;

            assert!(available_liquidity >= token_amount, "Insufficient pool liquidity");

            // Verify user's available collateral
            let caller = get_caller_address();
            let user_collateral_deposit = self.token_deposits.entry((caller, collateral)).read();
            let user_collateral_locked = self.locked_funds.entry((caller, collateral)).read();
            let available_user_collateral = user_collateral_deposit - user_collateral_locked;

            assert!(
                available_user_collateral >= required_collateral_value,
                "Insufficient user collateral"
            );

            // Calculate protocol fee and net token amount to transfer
            let protocol_fee = (token_amount * PROTOCOL_FEE_PERCENTAGE) / 100;
            let net_amount = token_amount - protocol_fee;

            // Transfer net borrowed tokens to the user
            IERC20Dispatcher { contract_address: token }.transfer(caller, net_amount);

            // Transfer protocol fee to the fee address
            IERC20Dispatcher { contract_address: token }
                .transfer(self.protocol_fee_address.read(), protocol_fee);

            // Lock user's collateral
            let prev_locked_funds = self.locked_funds.entry((caller, collateral)).read();
            self
                .locked_funds
                .entry((caller, collateral))
                .write(prev_locked_funds + required_collateral_value);

            // Update pool's collateral locked
            let prev_pool_locked = collateral_pool.total_collateral_locked.read();
            collateral_pool
                .total_collateral_locked
                .write(prev_pool_locked + required_collateral_value);

            // Update pool's borrowed amount
            let prev_pool_borrowed = token_pool.total_borrowed.read();
            token_pool.total_borrowed.write(prev_pool_borrowed + net_amount);

            // Update user's borrowed amount
            let user_borrowed = self.borrowed_assets.entry((caller, token)).read();
            self.borrowed_assets.entry((caller, token)).write(user_borrowed + net_amount);

            self
                .emit(
                    PoolBorrowSuccessful {
                        user: caller,
                        borrowed: token,
                        collateral: collateral,
                        borrowed_amount: net_amount,
                        collateral_locked_amount: required_collateral_value,
                    }
                );
        }

        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "unauthorized caller");

            self.upgradeable.upgrade(new_class_hash);
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
            assert(lender_balance >= net_amount + fee_amount, 'insufficient lender balance');

            // Transfer net amount to borrower
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer(proposal.borrower, net_amount);

            // Transfer protocol fee to protocol fee address
            IERC20Dispatcher { contract_address: proposal.token }
                .transfer(self.protocol_fee_address.read(), fee_amount);

            // Mint SPOK
            let borrower_token_id = self.mint_spoks(proposal.id, proposal.borrower);

            //update total lent in user assets
          let total_lent = self.lent_assets.entry((lender, proposal.token)).read();
            self.lent_assets.entry((lender, proposal.token)).write(total_lent + net_amount);

            // Record Transaction
            self
                .record_transaction(
                    proposal.token, TransactionType::LEND, net_amount + fee_amount, lender
                );

            // Update Proposal
            let mut updated_proposal = proposal;

            updated_proposal.lender = lender;
            updated_proposal.is_accepted = true;
            updated_proposal.accepted_at = get_block_timestamp();
            updated_proposal.repayment_date = updated_proposal.accepted_at
                + proposal.duration * 86400;
            updated_proposal.borrower_nft_id = borrower_token_id;

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
            let required_collateral = proposal.required_collateral_value;
            let borrower_collateral_balance = self
                .token_deposits
                .entry((borrower, proposal.accepted_collateral_token))
                .read();
            assert(borrower_collateral_balance >= required_collateral, 'Insufficient collateral');

            // Lock borrowers collateral
            self
                .locked_funds
                .entry((borrower, proposal.accepted_collateral_token))
                .write(required_collateral);

            let proposal_token = IERC20Dispatcher { contract_address: proposal.token };
            // Transfer main amount from lender to borrower
            proposal_token.transfer(borrower, net_amount);
            // Transfer protocol fee to protocol fee address
            proposal_token.transfer(self.protocol_fee_address.read(), fee_amount);

            // Mint SPOK
            let borrower_token_id = self.mint_spoks(proposal.id, borrower);

            //update user assets
            let total_borrowed = self.borrowed_assets.entry((borrower, proposal.token)).read();
            self.borrowed_assets.entry((borrower, proposal.token)).write(total_borrowed + net_amount);

            // Record Transaction
            self
                .record_transaction(
                    proposal.token, TransactionType::BORROW, net_amount + fee_amount, borrower
                );

            // Update Proposal
            let mut updated_proposal = proposal;

            updated_proposal.borrower = borrower;
            updated_proposal.is_accepted = true;
            updated_proposal.accepted_at = get_block_timestamp();
            updated_proposal.repayment_date = updated_proposal.accepted_at
                + proposal.duration * 86400;
            updated_proposal.borrower_nft_id = borrower_token_id;

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
            ref self: ContractState,
            proposal_id: u256,
            borrower: ContractAddress
        ) -> u256 {
            let spok = IPeerSPOKNFTDispatcher { contract_address: self.spok_nft.read() };

            // Mint NFTs to only the borrower
            let borrower_token_id = self.last_spok_id.read() + 1;
            // println!("borrower nft id: {}", borrower_token_id);

            spok.mint(borrower, borrower_token_id, proposal_id);

            self.last_spok_id.write(borrower_token_id);

            borrower_token_id
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
        }

        fn _deploy_liquidity_pool(
            ref self: ContractState,
            token: ContractAddress,
            caller: ContractAddress,
            opt_threshold_percentage: Option<u256>,
            opt_minimum_liquidation_amount: Option<u256>
        ) {
            // check whether caller is a maintainer or an owner
            assert!(
                self.owner.read() == caller || self.accesscontrol.has_role(MAINTAINER_ROLE, caller),
                "Unauthorized Access"
            );

            // check whether token is supported
            let token_supported_check: bool = self.supported_tokens.entry(token).read();
            assert!(token_supported_check, "Token is not supported");

            // check whether pool does not exists
            let pool_exist_check = (self.pools.entry(token).pool_token.read() == Zero::zero()
                && !self.pools.entry(token).is_active.read());
            assert!(pool_exist_check, "Pool already exist");

            // initialize liquidation threshold.
            self
                ._init_liquidation_threshold(
                    token, opt_threshold_percentage, opt_minimum_liquidation_amount
                );

            // Initialize default rates with default values
            self
                .update_pool_rates(
                    token,
                    20_000, // 2% base rate (Rbase)
                    800_000, // 80% optimal utilization (Ukink)
                    80_000, // 8% slope1 
                    400_000 // 40% slope2 (steeper after kink)
                );

            // Initialize pool data with zero totals
            let pool_data = PoolData {
                pool_token: token,
                is_active: true,
                total_deposits: 0,
                total_borrowed: 0,
                total_collateral_locked: 0
            };

            // activate pool
            self.pools.entry(token).write(pool_data);
        }

        fn _init_liquidation_threshold(
            ref self: ContractState,
            token: ContractAddress,
            opt_threshold_percentage: Option<u256>,
            opt_minimum_liquidation_amount: Option<u256>
        ) {
            let mut liquidation_threshold = get_default_liquidation_threshold();

            // Override default threshold if provided
            if let Option::Some(threshold_percentage) = opt_threshold_percentage {
                liquidation_threshold.threshold_percentage = threshold_percentage;
            }

            // Override default minimum amount if provided
            if let Option::Some(minimum_liquidation_amount) = opt_minimum_liquidation_amount {
                liquidation_threshold.minimum_liquidation_amount = minimum_liquidation_amount;
            }

            // Validate thresholds
            assert!(
                liquidation_threshold.minimum_liquidation_amount > 0, "Invalid liquidation amount"
            );
            assert!(liquidation_threshold.threshold_percentage > 0, "Invalid threshold percentage");

            // Store the liquidation threshold
            self.liquidation_thresholds.entry(token).write(Option::Some(liquidation_threshold));
        }

        fn _verify_liquidation(ref self: ContractState, proposal: @Proposal) -> (u256, bool, u256) {
            assert(
                self.pools.entry(*proposal.accepted_collateral_token).is_active.read(), 'Pool Error'
            );

            let (loan_token_price, loan_decimals) = self.get_token_price(*proposal.token);
            let (collateral_token_price, collateral_decimals) = self
                .get_token_price(*proposal.accepted_collateral_token);

            // Initially, the ltv is at 76% on borrow. Threshold is 85% to trigger liquidation.
            // convert both the current loan amount tokens and the current collateral amount tokens
            // to USD (to match), then check the current ltv.
            let current_loan_value_in_usd = (*proposal.token_amount * loan_token_price)
                / (ONE_E18 * fast_power(10_u32, loan_decimals).into());

            let current_collateral_value_in_usd = (*proposal.required_collateral_value
                * collateral_token_price)
                / (ONE_E18 * fast_power(10_u32, collateral_decimals).into());
            // Calculate current LTV ratio
            let current_ltv = (current_loan_value_in_usd * 100) / current_collateral_value_in_usd;

            // Get liquidation threshold for collateral token
            let opt_threshold = self
                .liquidation_thresholds
                .entry(*proposal.accepted_collateral_token)
                .read();
            assert!(opt_threshold.is_some(), "Liquidation threshold not set");

            let threshold = opt_threshold.unwrap();
            let can_liquidate_ref = current_ltv >= threshold.threshold_percentage;
            let gas_percentage = threshold.threshold_percentage - current_ltv;
            let liquidation_amount = gas_percentage * current_collateral_value_in_usd / 100;
            let can_liquidate = can_liquidate_ref
                && liquidation_amount >= threshold.minimum_liquidation_amount;

            // convert to the amount of tokens before recording
            // though from the current state of this codebase, it's never used.
            let current_loan_value = (current_loan_value_in_usd
                * ONE_E18
                * fast_power(10_u32, loan_decimals).into())
                / loan_token_price;

            (current_ltv, can_liquidate, current_loan_value)
        }
    }
}

