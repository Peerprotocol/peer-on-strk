use starknet::{ContractAddress, get_contract_address};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, DeclareResult, start_cheat_caller_address,
    stop_cheat_caller_address, spy_events, EventSpyAssertionsTrait
};

use peer_protocol::interfaces::ipeer_protocol::{
    IPeerProtocolDispatcher, IPeerProtocolDispatcherTrait
};
use peer_protocol::peer_protocol::PeerProtocol;

use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};

use peer_protocol::peer_protocol::ProposalType;

const ONE_E18: u256 = 1000000000000000000_u256;
const COLLATERAL_RATIO_NUMERATOR: u256 = 13_u256;
const COLLATERAL_RATIO_DENOMINATOR: u256 = 10_u256;

fn deploy_token(name: ByteArray) -> ContractAddress {
    let contract = declare("MockToken").unwrap().contract_class();

    let mut constructor_calldata = ArrayTrait::new();
    name.serialize(ref constructor_calldata);

    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    contract_address
}

fn deploy_peer_protocol() -> ContractAddress {
    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let protocol_fee_address: ContractAddress = starknet::contract_address_const::<0x129996789>();
    let spok_nft: ContractAddress = starknet::contract_address_const::<0x100026789>();

    let mut constructor_calldata = ArrayTrait::new();
    constructor_calldata.append(owner.into());
    constructor_calldata.append(protocol_fee_address.into());
    constructor_calldata.append(spok_nft.into());

    let contract = declare("PeerProtocol").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    contract_address
}

#[test]
#[should_panic(expected: "token not supported")]
fn test_deposit_should_panic_for_unsupported_token() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();
    let mint_amount: u256 = 1000 * ONE_E18;

    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    token.mint(caller, mint_amount);

    // Approving peer_protocol contract to spend mock_token
    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    // Prank caller to deposit into peer protocol
    start_cheat_caller_address(peer_protocol_address, caller);
    let deposit_amount: u256 = 100 * ONE_E18;
    peer_protocol.deposit(token_address, deposit_amount);
    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_deposit() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();
    let mint_amount: u256 = 1000 * ONE_E18;

    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();

    // Prank owner to add supported token in peer protocol
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    stop_cheat_caller_address(peer_protocol_address);

    token.mint(caller, mint_amount);

    // Approving peer_protocol contract to spend mock_token
    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    // Prank caller to deposit into peer protocol
    start_cheat_caller_address(peer_protocol_address, caller);
    let deposit_amount: u256 = 100 * ONE_E18;
    let mut spy = spy_events();

    peer_protocol.deposit(token_address, deposit_amount);

    // testing peer_protocol contract balance increase
    assert!(token.balance_of(peer_protocol_address) == deposit_amount, "deposit failed");

    // testing emitted event
    let expected_event = PeerProtocol::Event::DepositSuccessful(
        PeerProtocol::DepositSuccessful {
            user: caller, token: token_address, amount: deposit_amount
        }
    );

    spy.assert_emitted(@array![(peer_protocol_address, expected_event)]);

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_withdraw() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();

    let mint_amount: u256 = 1000 * ONE_E18;
    let deposit_amount: u256 = 100 * ONE_E18;
    let withdraw_amount: u256 = 50 * ONE_E18;

    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    stop_cheat_caller_address(peer_protocol_address);

    // Mint tokens
    token.mint(caller, mint_amount);

    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    start_cheat_caller_address(peer_protocol_address, caller);
    peer_protocol.deposit(token_address, deposit_amount);

    let mut spy = spy_events();
    peer_protocol.withdraw(token_address, withdraw_amount);
    assert!(
        token.balance_of(peer_protocol_address) == deposit_amount - withdraw_amount,
        "incorrect protocol balance after withdrawal"
    );
    assert!(
        token.balance_of(caller) == mint_amount - deposit_amount + withdraw_amount,
        "incorrect user balance after withdrawal"
    );
    let expected_event = PeerProtocol::Event::WithdrawalSuccessful(
        PeerProtocol::WithdrawalSuccessful {
            user: caller, token: token_address, amount: withdraw_amount
        }
    );
    spy.assert_emitted(@array![(peer_protocol_address, expected_event)]);

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_get_user_assets() {
    let token1_address = deploy_token("MockToken1");
    let token2_address = deploy_token("MockToken2");
    let peer_protocol_address = deploy_peer_protocol();

    let token1 = IERC20Dispatcher { contract_address: token1_address };
    let token2 = IERC20Dispatcher { contract_address: token2_address };

    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();
    let mint_amount: u256 = 10000 * ONE_E18;

    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();

    // Prank owner to add supported token in peer protocol
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token1_address);
    peer_protocol.add_supported_token(token2_address);
    stop_cheat_caller_address(peer_protocol_address);

    token1.mint(caller, mint_amount);
    token2.mint(caller, mint_amount);

    // Approving peer_protocol contract to spend mock_token
    start_cheat_caller_address(token1_address, caller);
    token1.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token1_address);

    start_cheat_caller_address(token2_address, caller);
    token2.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token2_address);

    // Prank caller to deposit into peer protocol
    start_cheat_caller_address(peer_protocol_address, caller);
    let deposit_amount1: u256 = 1000 * ONE_E18;
    let deposit_amount2: u256 = 100 * ONE_E18;

    peer_protocol.deposit(token1_address, deposit_amount1);
    peer_protocol.deposit(token2_address, deposit_amount2);

    let user_assets = peer_protocol.get_user_assets(caller);

    assert!(
        *user_assets.at(0).available_balance == deposit_amount1, "wrong asset available_balance 1"
    );
    assert!(*user_assets.at(0).token_address == token1_address, "wrong asset token1");

    assert!(
        *user_assets.at(1).available_balance == deposit_amount2, "wrong asset available_balance 2"
    );
    assert!(*user_assets.at(1).token_address == token2_address, "wrong asset token2");

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_get_user_deposits() {
    // Deploy contracts
    let token1_address = deploy_token("MockToken1");
    let token2_address = deploy_token("MockToken2");
    // add another supported token without balance
    let token3_address = deploy_token("MockToken3");
    let peer_protocol_address = deploy_peer_protocol();

    // Setup dispatchers
    let token1 = IERC20Dispatcher { contract_address: token1_address };
    let token2 = IERC20Dispatcher { contract_address: token2_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    // Setup addresses
    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let user: ContractAddress = starknet::contract_address_const::<0x122226789>();

    // Define amounts
    let mint_amount: u256 = 1000 * ONE_E18;
    let deposit_amount1: u256 = 100 * ONE_E18;
    let deposit_amount2: u256 = 200 * ONE_E18;

    // Add supported tokens
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token1_address);
    peer_protocol.add_supported_token(token2_address);
    peer_protocol.add_supported_token(token3_address);
    stop_cheat_caller_address(peer_protocol_address);

    // Mint tokens to user
    token1.mint(user, mint_amount);
    token2.mint(user, mint_amount);

    // Approve spending
    start_cheat_caller_address(token1_address, user);
    token1.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token1_address);

    start_cheat_caller_address(token2_address, user);
    token2.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token2_address);

    // Make deposits
    start_cheat_caller_address(peer_protocol_address, user);
    peer_protocol.deposit(token1_address, deposit_amount1);
    peer_protocol.deposit(token2_address, deposit_amount2);

    // Get and verify user deposits
    let user_deposits = peer_protocol.get_user_deposits(user);

    assert!(user_deposits.len() == 2, "incorrect number of deposits");

    // Verify deposit amounts for each token
    let deposit1 = user_deposits.at(0);
    let deposit2 = user_deposits.at(1);

    assert!(
        *deposit1.token == token1_address && *deposit1.amount == deposit_amount1,
        "incorrect deposit1"
    );
    assert!(
        *deposit2.token == token2_address && *deposit2.amount == deposit_amount2,
        "incorrect deposit2"
    );
    assert!(deposit1.token != deposit2.token, "duplicate tokens in result");

    stop_cheat_caller_address(peer_protocol_address);

    // Test for random user
    let random_user: ContractAddress = starknet::contract_address_const::<0x987654321>();
    let random_user_deposits = peer_protocol.get_user_deposits(random_user);
    assert!(random_user_deposits.len() == 0, "random user should have no deposits");
}

#[test]
#[should_panic(expected: "invalid user address")]
fn test_get_user_deposits_with_zero_address() {
    // Deploy contracts
    let peer_protocol_address = deploy_peer_protocol();
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    // Test with zero address - should panic
    let zero_address: ContractAddress = starknet::contract_address_const::<0>();
    peer_protocol.get_user_deposits(zero_address);
}

#[test]
fn test_create_borrow_proposal() {
    let token_address = deploy_token("MockToken");
    let collateral_token_address = deploy_token("MockToken1");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let collateral_token = IERC20Dispatcher { contract_address: collateral_token_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let borrower: ContractAddress = starknet::contract_address_const::<0x122226789>();

    let mint_amount: u256 = 1000 * ONE_E18;
    let borrow_amount: u256 = 500 * ONE_E18;
    let interest_rate: u64 = 5;
    let duration: u64 = 10;
    let required_collateral_value = 300 * ONE_E18;
    let collateral_value_with_ratio = (required_collateral_value * COLLATERAL_RATIO_NUMERATOR)
        / COLLATERAL_RATIO_DENOMINATOR;

    // Add supported token
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    peer_protocol.add_supported_token(collateral_token_address);
    stop_cheat_caller_address(peer_protocol_address);

    token.mint(borrower, mint_amount);
    collateral_token.mint(borrower, mint_amount);

    // Approve token
    start_cheat_caller_address(token_address, borrower);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    // Approve collateral token
    start_cheat_caller_address(collateral_token_address, borrower);
    collateral_token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(collateral_token_address);

    // Borrower Deposit collateral
    start_cheat_caller_address(peer_protocol_address, borrower);
    peer_protocol.deposit(collateral_token_address, collateral_value_with_ratio);
    stop_cheat_caller_address(peer_protocol_address);

    // Borrower creates a borrow proposal
    start_cheat_caller_address(peer_protocol_address, borrower);
    let mut spy = spy_events();

    peer_protocol
        .create_borrow_proposal(
            token_address,
            collateral_token_address,
            borrow_amount,
            required_collateral_value,
            interest_rate,
            duration
        );

    // Check emitted event
    let created_at = starknet::get_block_timestamp();
    let expected_event = PeerProtocol::Event::ProposalCreated(
        PeerProtocol::ProposalCreated {
            proposal_type: ProposalType::BORROWING,
            borrower,
            token: token_address,
            amount: borrow_amount,
            interest_rate,
            duration,
            created_at,
        }
    );

    spy.assert_emitted(@array![(peer_protocol_address, expected_event)]);

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
#[should_panic(expected: "Token not supported")]
fn test_create_borrow_proposal_should_panic_for_unsupported_token() {
    let token_address = deploy_token("MockToken");
    let collateral_token_address = deploy_token("MockToken1");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let collateral_token = IERC20Dispatcher { contract_address: collateral_token_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let borrower: ContractAddress = starknet::contract_address_const::<0x122226789>();

    let mint_amount: u256 = 1000 * ONE_E18;
    let borrow_amount: u256 = 500 * ONE_E18;
    let interest_rate: u64 = 5;
    let duration: u64 = 10;
    let required_collateral_value = 300 * ONE_E18;

    // Add supported token
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    peer_protocol.add_supported_token(collateral_token_address);
    stop_cheat_caller_address(peer_protocol_address);

    token.mint(borrower, mint_amount);
    collateral_token.mint(borrower, mint_amount);

    // Approve the peer_protocol contract to spend tokens
    start_cheat_caller_address(token_address, borrower);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    // Approve the peer_protocol contract to spend collateral tokens
    start_cheat_caller_address(collateral_token_address, borrower);
    collateral_token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(collateral_token_address);

    // Simulate using an unsupported token address
    let unsupported_token_address: ContractAddress = starknet::contract_address_const::<
        0x0
    >(); // Invalid token address

    start_cheat_caller_address(peer_protocol_address, borrower);

    peer_protocol
        .create_borrow_proposal(
            unsupported_token_address,
            collateral_token_address,
            borrow_amount,
            required_collateral_value,
            interest_rate,
            duration
        );

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_get_all_proposals_with_no_proposals() {
    let peer_protocol_address = deploy_peer_protocol();
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    let proposals = peer_protocol.get_all_proposals();
    assert(proposals.len() == 0, 'Should be empty');
}

#[test]
fn test_get_all_proposals() {
    // Deploy and setup
    let (token_address, collateral_token_address, peer_protocol_address) = setup_protocol();
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    let borrower = starknet::contract_address_const::<0x122226789>();

    // Setup borrower
    setup_borrower(
        peer_protocol_address, 
        token_address,
        collateral_token_address,
        borrower, 
        1000 * ONE_E18
    );

    // Create two proposals
    start_cheat_caller_address(peer_protocol_address, borrower);
    create_test_proposal(
        peer_protocol_address, 
        token_address,
        collateral_token_address,
        500 * ONE_E18, 
        5_u64, 
        7_u64
    );
    create_test_proposal(
        peer_protocol_address, 
        token_address,
        collateral_token_address,
        300 * ONE_E18, 
        7_u64, 
        10_u64
    );

    // Verify proposals
    let proposals = peer_protocol.get_all_proposals();
    assert(proposals.len() == 2, 'Wrong number of proposals');

    let first = *proposals.at(0);
    assert(first.amount == 500 * ONE_E18, 'Wrong first amount');
    assert(first.interest_rate == 5_u64, 'Wrong first rate');

    let second = *proposals.at(1);
    assert(second.amount == 300 * ONE_E18, 'Wrong second amount');
    assert(second.interest_rate == 7_u64, 'Wrong second rate');
    
    stop_cheat_caller_address(peer_protocol_address);
}

fn deploy_spok_nft() -> ContractAddress {
    let contract = declare("MockNFT").unwrap().contract_class();
    let mut constructor_calldata = ArrayTrait::new();
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

// Helper function to setup protocol and tokens
fn setup_protocol() -> (ContractAddress, ContractAddress, ContractAddress) {
    let token_address = deploy_token("MockToken");
    let collateral_token_address = deploy_token("MockToken1");
    let peer_protocol_address = deploy_peer_protocol();
    
    let owner = starknet::contract_address_const::<0x123626789>();
    
    start_cheat_caller_address(peer_protocol_address, owner);
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    peer_protocol.add_supported_token(token_address);
    peer_protocol.add_supported_token(collateral_token_address);
    stop_cheat_caller_address(peer_protocol_address);
    
    (token_address, collateral_token_address, peer_protocol_address)
}

// Helper function to setup borrower
fn setup_borrower(
    peer_protocol_address: ContractAddress,
    token_address: ContractAddress,
    collateral_token_address: ContractAddress,
    borrower: ContractAddress,
    amount: u256
) {
    let token = IERC20Dispatcher { contract_address: token_address };
    let collateral_token = IERC20Dispatcher { contract_address: collateral_token_address };
    
    // Mint tokens
    token.mint(borrower, amount);
    collateral_token.mint(borrower, amount);

    // Approve tokens
    start_cheat_caller_address(token_address, borrower);
    token.approve(peer_protocol_address, amount);
    stop_cheat_caller_address(token_address);

    start_cheat_caller_address(collateral_token_address, borrower);
    collateral_token.approve(peer_protocol_address, amount);
    stop_cheat_caller_address(collateral_token_address);
}

// Helper function to setup lender
fn setup_lender(
    peer_protocol_address: ContractAddress,
    token_address: ContractAddress,
    lender: ContractAddress,
    amount: u256
) {
    let token = IERC20Dispatcher { contract_address: token_address };
    token.mint(lender, amount);
    
    start_cheat_caller_address(token_address, lender);
    token.approve(peer_protocol_address, amount);
    stop_cheat_caller_address(token_address);
    
    start_cheat_caller_address(peer_protocol_address, lender);
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    peer_protocol.deposit(token_address, amount);
    stop_cheat_caller_address(peer_protocol_address);
}

// Helper function to create a test proposal
fn create_test_proposal(
    peer_protocol_address: ContractAddress,
    token_address: ContractAddress,
    collateral_token_address: ContractAddress,
    amount: u256,
    rate: u64,
    duration: u64
) {
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    let collateral_value = 300 * ONE_E18;
    let collateral_with_ratio = (collateral_value * COLLATERAL_RATIO_NUMERATOR) / COLLATERAL_RATIO_DENOMINATOR;
    
    peer_protocol.deposit(collateral_token_address, collateral_with_ratio);
    peer_protocol.create_borrow_proposal(
        token_address,
        collateral_token_address,
        amount,
        collateral_value,
        rate,
        duration
    );
}