#[starknet::contract]
pub mod MockToken {
    use starknet::event::EventEmitter;
    use starknet::{ContractAddress, get_caller_address};
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry
    };
    use peer_protocol::interfaces::ierc20::IERC20;
    use peer_protocol::interfaces::ierc20_permit::IERC20Permit;
    use core::num::traits::Zero;

    #[storage]
    pub struct Storage {
        balances: Map<ContractAddress, u256>,
        allowances: Map<
            (ContractAddress, ContractAddress), u256
        >, // Mapping<(owner, spender), amount>
        nonces: Map<ContractAddress, u256>, // EIP-2612 nonces
        token_name: ByteArray,
        symbol: ByteArray,
        decimal: u8,
        total_supply: u256,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Transfer: Transfer,
        Approval: Approval,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        value: u256
    }

    #[constructor]
    fn constructor(ref self: ContractState, name: ByteArray) {
        self.token_name.write(name);
        self.symbol.write("MKT");
        self.decimal.write(18);
        self.owner.write(get_caller_address());
    }

    #[abi(embed_v0)]
    impl MockTokenImpl of IERC20<ContractState> {
        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            let balance = self.balances.entry(account).read();

            balance
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress
        ) -> u256 {
            let allowance = self.allowances.entry((owner, spender)).read();

            allowance
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            let sender = get_caller_address();

            let sender_prev_balance = self.balances.entry(sender).read();
            let recipient_prev_balance = self.balances.entry(recipient).read();

            assert(sender_prev_balance >= amount, 'Insufficient amount');

            self.balances.entry(sender).write(sender_prev_balance - amount);
            self.balances.entry(recipient).write(recipient_prev_balance + amount);

            assert(
                self.balances.entry(recipient).read() > recipient_prev_balance, 'Transaction failed'
            );

            self.emit(Transfer { from: sender, to: recipient, amount });

            true
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) -> bool {
            let spender = get_caller_address();

            let spender_allowance = self.allowances.entry((sender, spender)).read();
            let sender_balance = self.balances.entry(sender).read();
            let recipient_balance = self.balances.entry(recipient).read();

            assert(amount <= spender_allowance, 'amount exceeds allowance');
            assert(amount <= sender_balance, 'amount exceeds balance');

            self.allowances.entry((sender, spender)).write(spender_allowance - amount);
            self.balances.entry(sender).write(sender_balance - amount);
            self.balances.entry(recipient).write(recipient_balance + amount);

            self.emit(Transfer { from: sender, to: recipient, amount });

            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            let caller = get_caller_address();

            self.allowances.entry((caller, spender)).write(amount);

            self.emit(Approval { owner: caller, spender, value: amount });

            true
        }

        fn name(self: @ContractState) -> ByteArray {
            self.token_name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimal.read()
        }

        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            let previous_total_supply = self.total_supply.read();
            let previous_balance = self.balances.entry(recipient).read();

            self.total_supply.write(previous_total_supply + amount);
            self.balances.entry(recipient).write(previous_balance + amount);

            let zero_address = Zero::zero();

            self.emit(Transfer { from: zero_address, to: recipient, amount });

            true
        }
    }


#[abi(embed_v0)]
    impl MockTokenPermitImpl of IERC20Permit<ContractState> {
        fn permit(
            ref self: ContractState,
            owner: ContractAddress,
            spender: ContractAddress,
            value: u256,
            deadline: u64,
            v: u8,
            r: felt252,
            s: felt252
        ) {
            // For testing: Skip signature validation but enforce deadline
            let current_time = starknet::get_block_timestamp();
            assert!(current_time <= deadline, "permit expired");

            // Increment nonce
            let nonce = self.nonces.entry(owner).read();
            self.nonces.entry(owner).write(nonce + 1);

            // Set allowance
            self.allowances.entry((owner, spender)).write(value);

            self.emit(Approval { owner, spender, value });
        }

        fn nonces(self: @ContractState, owner: ContractAddress) -> u256 {
            self.nonces.entry(owner).read()
        }

        fn DOMAIN_SEPARATOR(self: @ContractState) -> felt252 {
            0x1234
        }
    }
}