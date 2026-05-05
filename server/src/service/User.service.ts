import { pool } from "../config/db.config";
import { QueryResult } from "pg";

export interface IUser {
  id: string;
  email: string;
  name?: string;
  password?: string;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  password?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

export class UserService {
  /**
   * Find a user by ID
   */
 static async findById(id: string): Promise<IUser | null> {
    try {
      const query = `
        SELECT id, email, name, password
        FROM "User"
        WHERE id = $1
      `;
      const result: QueryResult<IUser> = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const query = `
        SELECT id, email, name, password
        FROM "User"
        WHERE email = $1
      `;
      const result: QueryResult<IUser> = await pool.query(query, [email]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  static async findAll(limit: number = 100, offset: number = 0): Promise<IUser[]> {
    try {
      const query = `
        SELECT id, email, name, password
        FROM "User"
        LIMIT $1 OFFSET $2
      `;
      const result: QueryResult<IUser> = await pool.query(query, [
        limit,
        offset,
      ]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async create(userData: CreateUserInput): Promise<IUser> {
    try {
      if (!userData.email) {
        throw new Error("Email is required");
      }

      const query = `
        INSERT INTO "User" (id, email, name, password)
        VALUES (gen_random_uuid(), $1, $2, $3)
        RETURNING id, email, name, password
      `;
      const result: QueryResult<IUser> = await pool.query(query, [
        userData.email,
        userData.name || null,
        userData.password || null,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update a user
   */
  static async update(
    id: string,
    updateData: UpdateUserInput
  ): Promise<IUser | null> {
    try {
      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.email !== undefined) {
        updates.push(`email = $${paramCount}`);
        values.push(updateData.email);
        paramCount++;
      }
      if (updateData.name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(updateData.name);
        paramCount++;
      }
      if (updateData.password !== undefined) {
        updates.push(`password = $${paramCount}`);
        values.push(updateData.password);
        paramCount++;
      }

      if (updates.length === 0) {
        // No updates provided, return current user
        return UserService.findById(id);
      }

      values.push(id);
      const query = `
        UPDATE "User"
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING id, email, name, password
      `;

      const result: QueryResult<IUser> = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  static async delete(id: string) {
    try {
      const query = `
        DELETE FROM "User"
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rowCount && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Get total count of users
   */
  static async count(): Promise<number> {
    try {
      const query = `SELECT COUNT(*) FROM "User"`;
      const result: QueryResult<{ count: string }> = await pool.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error("Error counting users:", error);
      throw error;
    }
  }
}