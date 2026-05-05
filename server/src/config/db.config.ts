import { Pool } from "pg";
import config from "./config";



const configWithOutDB = {
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT,
};
export const defaultPool = new Pool(configWithOutDB);

export const pool = new Pool({
  ...configWithOutDB,
  database: config.DB_NAME,
});

