use starknet::ContractAddress;

#[starknet::interface]
pub trait IPeerSPOKNFT<TContractState> {
    // NFT contract
    fn mint(ref self: TContractState, proposal_id: u256, recipient: ContractAddress, token_id: u256);
}
