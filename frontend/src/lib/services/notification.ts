import { sql } from "@vercel/postgres";

export type Notification = {
  id?: number;
  user_address: string;
  message: string;
  timestamp?: Date;
};

export class NotificationService {
  static async create(notification: Notification) {
    const result = await sql`
      INSERT INTO notifications (user_address, message)
      VALUES (${notification.user_address}, ${notification.message})
      RETURNING id, user_address, message, timestamp;
    `;
    return result.rows[0];
  }

  static async createTransactionNotification(
    user_address: string,
    token: string,
    amount: number,
    transaction_type: string
  ) {
    const message = `${transaction_type}: ${amount} ${token}`;
    return this.create({ user_address, message });
  }

  static async getByUserAddress(user_address: string) {
    const result = await sql`
      SELECT id, message, timestamp
      FROM notifications
      WHERE user_address = ${user_address}
      ORDER BY timestamp DESC;
    `;
    return result.rows;
  }

  static async delete(id: string) {
    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${id}
      RETURNING id;
    `;
    return result.rows[0];
  }
}
