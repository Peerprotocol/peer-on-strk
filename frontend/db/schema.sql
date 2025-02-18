
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR NOT NULL,
    user_email VARCHAR NOT NULL,
    user_twitter VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR NOT NULL,
    token VARCHAR NOT NULL,
    amount VARCHAR NOT NULL,
    transaction_type VARCHAR NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE protocol_data (
    id SERIAL PRIMARY KEY,
    total_borrow VARCHAR NOT NULL,
    total_lend VARCHAR NOT NULL,
    total_p2p_deals VARCHAR NOT NULL,
    total_interest_earned VARCHAR NOT NULL,
    total_value_locked VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO protocol_data 
    (total_borrow, total_lend, total_p2p_deals, total_interest_earned, total_value_locked)
VALUES 
    ('1245678', '2890123', '1567', '156789', '413580235');