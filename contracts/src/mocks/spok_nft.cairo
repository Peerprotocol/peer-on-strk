#[starknet::contract]
mod SPOKNFT {
    use starknet::ContractAddress;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use peer_protocol::interfaces::ipeer_spok_nft::IPeerSPOKNFT;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        let token_uri: ByteArray = "https://dummy_uri.com/your_id";
        self.erc721.initializer("Peer Protocol SPOK", "PPS", token_uri);
    }

    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721MixinImpl<ContractState>;

    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl CasOnStarkImpl of IPeerSPOKNFT<ContractState> {
        fn mint(
            ref self: ContractState, recipient: ContractAddress, token_id: u256, proposal_id: u256,
        ) {
            self.erc721.mint(recipient, token_id);
        }
    }
}
