import dotenv from "dotenv";
dotenv.config();
interface CONFIG {
  PORT?: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  NODE_ENV?: string;
  DATABASE_URL?: string;
  SESSION_COOKIE_NAME_ACCESS?: string;
  SESSION_COOKIE_NAME_REFRESH?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  CLIENT_URL?: string;
}
const config:CONFIG  = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_NAME: process.env.DB_NAME || "mydb",
  DB_USER: process.env.DB_USER || "johndoe",
  DB_PASSWORD: process.env.DB_PASSWORD || "randompassword",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  SESSION_COOKIE_NAME_ACCESS: process.env.SESSION_COOKIE_NAME_ACCESS || "access_token",
  SESSION_COOKIE_NAME_REFRESH: process.env.SESSION_COOKIE_NAME_REFRESH || "refresh_token",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
}
export default config;