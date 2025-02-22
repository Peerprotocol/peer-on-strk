import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/services/notification";

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
    const notifications = await NotificationService.getByUserAddress(
      userAddress
    );

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching notifications",
        error: error.message,
      },
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

    const notification = await NotificationService.create({
      user_address,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification created successfully",
        data: notification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating notification",
        error: error.message,
      },
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
    const result = await NotificationService.delete(notificationId);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
      id: result.id,
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting notification",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
