import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  try {
    const newData = await request.json();

    // Get the most recent row
    const lastRow = await sql`
      SELECT * FROM protocol_data 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    let updatedData;
    
    if (lastRow.rows.length > 0) {
      const current = lastRow.rows[0];
      
      // Simply add the numbers
      updatedData = {
        total_borrow: (Number(current.total_borrow) + Number(newData.total_borrow)).toString(),
        total_lend: (Number(current.total_lend) + Number(newData.total_lend)).toString(),
        total_p2p_deals: (Number(current.total_p2p_deals) + Number(newData.total_p2p_deals)).toString(),
        total_value_locked: (Number(current.total_value_locked) + Number(newData.total_value_locked)).toString()
      };
    } else {
      updatedData = newData;
    }

    // Insert the updated data
    const result = await sql`
      INSERT INTO protocol_data (
        total_borrow, 
        total_lend, 
        total_p2p_deals, 
        total_value_locked
      )
      VALUES (
        ${updatedData.total_borrow},
        ${updatedData.total_lend},
        ${updatedData.total_p2p_deals},
        ${updatedData.total_value_locked}
      )
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      message: 'Protocol data added successfully',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error adding protocol data:', error);
    return NextResponse.json(
      { success: false, message: 'Error adding protocol data', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get only the most recent record as it contains the current totals
    const result = await sql`
      SELECT * FROM protocol_data 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No protocol data found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error fetching protocol data:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching protocol data', error: error.message },
      { status: 500 }
    );
  }
}