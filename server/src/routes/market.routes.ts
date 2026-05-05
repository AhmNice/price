import express from "express";
import {
  createMarket,
  deleteMarket,
  getMarketById,
  getMarketPrices,
  getMarkets,
  updateMarket,
} from "../controller/market.controller";

const marketRoute = express.Router();

marketRoute.post("/create", createMarket);
marketRoute.get("/list", getMarkets);
marketRoute.get("/:id", getMarketById);
marketRoute.get("/:id/prices", getMarketPrices);
marketRoute.patch("/:id", updateMarket);
marketRoute.delete("/:id", deleteMarket);

export default marketRoute;
