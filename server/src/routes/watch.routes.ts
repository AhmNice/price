import express from "express";
import {
  createWatchlist,
  deleteWatchlist,
  getUserWatchlist,
  updateWatchlist,
} from "../controller/watchList.controller";

const watchRoute = express.Router();

watchRoute.post("/create", createWatchlist);
watchRoute.get("/list/:userId", getUserWatchlist);
watchRoute.put("/:id", updateWatchlist);
watchRoute.delete("/:id", deleteWatchlist);

export default watchRoute;
