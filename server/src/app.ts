import express from "express";
import cors from "cors";
import config from "./config/config.js";

const app = express();
app.use(
  cors({
    origin: `${config.CLIENT_URL}`,
    methods: "GET,POST,PUT,DELETE , PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  }),
);
app.use(express.json());

export default app;
