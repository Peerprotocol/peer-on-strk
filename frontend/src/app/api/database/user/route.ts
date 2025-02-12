// app/api/users/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  
  const user = await sql`
    SELECT * FROM users WHERE wallet_address = ${wallet}
  `;
  return NextResponse.json(user.rows[0]);
}

export async function POST(request: Request) {
  const { wallet_address, user_email, user_twitter } = await request.json();
  
  const result = await sql`
    INSERT INTO users (wallet_address, user_email, user_twitter)
    VALUES (${wallet_address}, ${user_email}, ${user_twitter})
    RETURNING *
  `;
  return NextResponse.json(result.rows[0]);
}