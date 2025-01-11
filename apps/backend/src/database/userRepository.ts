import type { User } from "@/common/schemas/userSchema";
import type { User as ClerkUser } from "@clerk/express";
import { FieldPacket, Pool } from "mysql2/promise";

export class UserRepository {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db; // Set the db connection to a class property
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const [rows] = await this.db.query("SELECT * FROM users");
      return rows as User[];
    } catch (error) {
      console.error("Database query failed:", error);
      throw error;
    }
  }

  async storeUser(id: string, imageUrl: string, firstName: string, lastName: string, email: string, role: string): Promise<User> {
    try {
      let [rows]: [any[], FieldPacket[]] = await this.db.query("SELECT * FROM users WHERE id = ?", [id]);

      if (rows.length > 0) {
        console.log(`User with clerk id ${id} already exists`);
        return rows[0] as User;
      }

      const [result] = await this.db.query("INSERT INTO users (id, img_url, first_name, last_name, email, role) VALUES (?, ?, ?, ?, ?, ?)", [
        id,
        imageUrl,
        firstName,
        lastName,
        email,
        role
      ]);
      rows = await this.db.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0] as User;
    } catch (err) {
      console.error("Error saving user to database", err);
      throw new Error("Failed to save user");
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      // Parameterized query to prevent SQL injection
      const [rows]: [any[], FieldPacket[]] = await this.db.query("SELECT * FROM users WHERE id = ?", [id]);

      // Check if rows exist and are in an array-like format
      if (rows.length === 0) {
        return null;
      }

      // Return the first row as a User object
      return rows[0] as User;
    } catch (error) {
      console.error("Database query failed:", error);
      throw new Error("Failed to fetch user from the database");
    }
  }
}
