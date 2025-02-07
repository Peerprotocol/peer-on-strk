use starknet::ContractAddress;

#[starknet::interface]
pub trait IPeerSPOKNFT<TContractState> {
    // NFT contract
    fn mint(
        ref self: TContractState, recipient: ContractAddress, token_id: u256, proposal_id: u256,
    );

    fn burn(ref self: TContractState, token_id: u256);
}
