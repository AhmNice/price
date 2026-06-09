import express from "express";
import pool from "./db/connection.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
