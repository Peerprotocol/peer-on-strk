import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { NotificationService } from "@/lib/services/notification";

export async function POST(request: Request) {
  try {
    const { user_address, token, amount, transaction_type } =
      await request.json();

    const result = await sql`
      INSERT INTO transactions (user_address, token, amount, transaction_type)
      VALUES (${user_address}, ${token}, ${amount}, ${transaction_type})
      RETURNING *;
    `;

    // create a notification for the user
    await NotificationService.createTransactionNotification(
      user_address,
      token,
      amount,
      transaction_type
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get("user_address");
    const period = searchParams.get("period") || "max";

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    let result;

    if (period === "1 day") {
      result = await sql`
        SELECT user_address, token, amount, transaction_type, timestamp
        FROM transactions
        WHERE user_address = ${userAddress}
        AND timestamp >= NOW() - INTERVAL '1 day'
        ORDER BY timestamp ASC;
      `;
    } else if (period === "1 week") {
      result = await sql`
        SELECT user_address, token, amount, transaction_type, timestamp
        FROM transactions
        WHERE user_address = ${userAddress}
        AND timestamp >= NOW() - INTERVAL '7 days'
        ORDER BY timestamp ASC;
      `;
    } else if (period === "1 month") {
      result = await sql`
        SELECT user_address, token, amount, transaction_type, timestamp
        FROM transactions
        WHERE user_address = ${userAddress}
        AND timestamp >= NOW() - INTERVAL '1 month'
        ORDER BY timestamp ASC;
      `;
    } else {
      // Default case (fetch all transactions)
      result = await sql`
        SELECT user_address, token, amount, transaction_type, timestamp
        FROM transactions
        WHERE user_address = ${userAddress}
        ORDER BY timestamp ASC;
      `;
    }

    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
