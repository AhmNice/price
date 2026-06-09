import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: "abbaibrahim",
  host: "localhost",
  database: "project_db",
  password: "zaman2003",
  port: 5432,
});

export default pool;
