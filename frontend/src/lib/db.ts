import { sql } from '@vercel/postgres';

export async function testConnection() {
    try {
      const result = await sql`SELECT NOW()`;
      console.log('Database connected:', result);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

export async function createUser(userData: {
  wallet_address: string;
  user_email: string;
  user_twitter: string;
}) {
  return sql`
    INSERT INTO users (wallet_address, user_email, user_twitter)
    VALUES (${userData.wallet_address}, ${userData.user_email}, ${userData.user_twitter})
    RETURNING *
  `;
}

export async function createTransaction(txData: {
  user: string;
  token: string;
  amount: string;
  transaction_type: string;
}) {
  return sql`
    INSERT INTO transactions (user, token, amount, transaction_type)
    VALUES (${txData.user}, ${txData.token}, ${txData.amount}, ${txData.transaction_type})
    RETURNING *
  `;
}

export async function updateProtocolData(data: {
  total_borrow: string;
  total_lend: string;
  total_p2p_deals: string;
  total_interest_earned: string;
  total_value_locked: string;
}) {
  const existingData = await sql`SELECT id FROM protocol_data LIMIT 1`;
  
  if (existingData.rows.length > 0) {
    return sql`
      UPDATE protocol_data 
      SET 
        total_borrow = ${data.total_borrow},
        total_lend = ${data.total_lend},
        total_p2p_deals = ${data.total_p2p_deals},
        total_interest_earned = ${data.total_interest_earned},
        total_value_locked = ${data.total_value_locked}
      WHERE id = ${existingData.rows[0].id}
      RETURNING *
    `;
  } else {
    return sql`
      INSERT INTO protocol_data (
        total_borrow, total_lend, total_p2p_deals, 
        total_interest_earned, total_value_locked
      )
      VALUES (
        ${data.total_borrow}, ${data.total_lend}, ${data.total_p2p_deals},
        ${data.total_interest_earned}, ${data.total_value_locked}
      )
      RETURNING *
    `;
  }
}