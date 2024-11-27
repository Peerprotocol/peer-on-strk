use starknet::ContractAddress;

use peer_protocol::peer_protocol::{
    Transaction, UserAssets, UserDeposit, BorrowedDetails, Proposal, LiquidationInfo
};

use core::array::Array;
use core::array::SpanTrait;

#[starknet::interface]
pub trait IPeerProtocol<TContractState> {
    fn deposit(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn add_supported_token(ref self: TContractState, token_address: ContractAddress);
    fn withdraw(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn create_borrow_proposal(
        ref self: TContractState,
        token: ContractAddress,
        accepted_collateral_token: ContractAddress,
        amount: u256,
        required_collateral_value: u256,
        interest_rate: u64,
        duration: u64
 )->u256;
    fn accept_proposal(ref self: TContractState, proposal_id: u256);
    fn counter_proposal(
        ref self: TContractState,
        proposal_id: u256,
        amount: u256,
        required_collateral_value: u256,
        interest_rate: u64,
        duration: u64
    );

    fn get_borrow_proposal_details(self: @TContractState) -> Array<Proposal>;
    fn accept_proposal(ref self: TContractState, proposal_id: u256);
    fn repay_proposal(ref self: TContractState, proposal_id: u256);

    fn get_borrowed_tokens(self: @TContractState, user: ContractAddress) -> Array<BorrowedDetails>;

    fn create_lending_proposal(
        ref self: TContractState,
        token: ContractAddress,
        accepted_collateral_token: ContractAddress,
        amount: u256,
        required_collateral_value: u256,
        interest_rate: u64,
        duration: u64
    );


    fn get_lending_proposal_details(self: @TContractState) -> Array<Proposal>;
    fn check_positions_for_liquidation(
        ref self: TContractState, user: ContractAddress
    ) -> Array<LiquidationInfo>;
    fn liquidate_position(ref self: TContractState, proposal_id: u256);
    fn get_token_price(self: @TContractState, token: ContractAddress) -> u256;
    fn record_liquidation(
        ref self: TContractState,
        borrower: ContractAddress,
        lender: ContractAddress,
        loan_token: ContractAddress,
        collateral_token: ContractAddress,
        loan_value: u256,
        collateral_value: u256
    );

    fn get_transaction_history(
        self: @TContractState, user: ContractAddress, offset: u64, limit: u64
    ) -> Array<Transaction>;
    
    fn get_user_assets(self: @TContractState, user: ContractAddress) -> Array<UserAssets>;
    
    fn get_user_deposits(self: @TContractState, user: ContractAddress) -> Span<UserDeposit>;
}
