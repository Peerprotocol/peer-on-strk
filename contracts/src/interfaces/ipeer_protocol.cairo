use starknet::ContractAddress;
use peer_protocol::peer_protocol::{Transaction, UserAssets, UserDeposit, BorrowPosition};
use core::array::Array;
use core::array::SpanTrait;

#[starknet::interface]
pub trait IPeerProtocol<TContractState> {
    fn deposit(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn add_supported_token(ref self: TContractState, token_address: ContractAddress);
    fn withdraw(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn create_borrow_proposal(ref self: TContractState,token: ContractAddress,amount: u256,interest_rate:u64,duration:u64,
    );
    fn get_transaction_history(self: @TContractState, user: ContractAddress, offset: u64, limit: u64) -> Array<Transaction>;
    fn get_user_assets(self: @TContractState, user: ContractAddress) -> Array<UserAssets>;
    fn get_user_deposits(self: @TContractState, user: ContractAddress) -> Span<UserDeposit>;
    fn update_borrow_position(ref self: TContractState, collateral_amount: u256, borrowed_amount: u256, collateral_symbol: felt252, asset_symbol: felt252);
    fn get_borrow_position(self: @TContractState, user: ContractAddress) -> BorrowPosition;
}