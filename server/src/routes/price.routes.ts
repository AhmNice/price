import express from "express";

import {
  addMultiplePrices,
  addPrice,
  deletePrice,
  getLatestProductPrices,
  getPriceById,
  getPrices,
  getProductPriceHistory,
  updatePrice,
} from "../controller/price.controller.js";

const priceRoute = express.Router();

priceRoute.post("/create", addPrice);
priceRoute.post("/create-many", addMultiplePrices);
priceRoute.get("/list", getPrices);
priceRoute.get("/product/:productId/latest", getLatestProductPrices);
priceRoute.get("/product/:productId/history", getProductPriceHistory);
priceRoute.get("/:id", getPriceById);
priceRoute.put("/:id", updatePrice);
priceRoute.delete("/:id", deletePrice);

export default priceRoute;
