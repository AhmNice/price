import { pool } from "./db.config.js";

export const connect_database = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    client.release();
  } catch (error) {
    console.log("Error connecting to database:", error);
    throw error;
  }
};
