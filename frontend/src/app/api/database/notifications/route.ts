import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET: Fetch notifications for a specific user address
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get("user_address");
    
    if (!userAddress) {
      return NextResponse.json(
        { success: false, message: "User address is required" },
        { status: 400 }
      );
    }

    // Get notifications for the user, ordered by most recent first
    const result = await sql`
      SELECT id, message, timestamp
      FROM notifications
      WHERE user_address = ${userAddress}
      ORDER BY timestamp DESC;
    `;

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching notifications", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new notification for a user
export async function POST(req: Request) {
  try {
    const { user_address, message } = await req.json();

    // Validate required fields
    if (!user_address || !message) {
      return NextResponse.json(
        { success: false, message: "User address and message are required" },
        { status: 400 }
      );
    }

    // Insert new notification
    const result = await sql`
      INSERT INTO notifications (user_address, message)
      VALUES (${user_address}, ${message})
      RETURNING id, user_address, message, timestamp;
    `;

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      data: result.rows[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, message: "Error creating notification", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a notification by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    
    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Delete the notification
    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${notificationId}
      RETURNING id;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
      id: result.rows[0].id
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting notification", error: error.message },
      { status: 500 }
    );
  }
}