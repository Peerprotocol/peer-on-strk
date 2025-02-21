// interfaces/ierc20_permit.cairo
use starknet::ContractAddress;

#[starknet::interface]
pub trait IERC20Permit<TContractState> {
    fn permit(
        ref self: TContractState,
        owner: ContractAddress,
        spender: ContractAddress,
        value: u256,
        deadline: u64,
        v: u8,
        r: felt252,
        s: felt252
    );

    fn nonces(self: @TContractState, owner: ContractAddress) -> u256;
    fn DOMAIN_SEPARATOR(self: @TContractState) -> felt252;
}