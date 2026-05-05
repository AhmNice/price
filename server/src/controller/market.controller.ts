import { Request, Response } from "express";
import { BadRequestError } from "../middleware/error.handler.js";
import { MarketService } from "../service/Market.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// CREATE MARKET
export const createMarket = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      throw new BadRequestError({
        message: "Name is required",
        code: "MISSING_NAME",
      });
    }

    const market = await MarketService.create({ name, location });

    return res
      .status(201)
      .json(new ApiResponse(201, market, "Market created successfully"));
  } catch (error: any) {
    if (error?.message === "Market not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error creating market:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL MARKETS
export const getMarkets = async (_req: Request, res: Response) => {
  try {
    const markets = await MarketService.getAll();

    return res
      .status(200)
      .json(new ApiResponse(200, markets, "Markets fetched successfully"));
  } catch (error) {
    console.error("Error fetching markets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET SINGLE MARKET
export const getMarketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Market ID is required",
        code: "MISSING_ID",
      });
    }

    const market = await MarketService.getById(`${id}`);

    return res
      .status(200)
      .json(new ApiResponse(200, market, "Market fetched successfully"));
  } catch (error: any) {
    if (error?.message === "Market not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error fetching market:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE MARKET
export const updateMarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    if (!id) {
      throw new BadRequestError({
        message: "Market ID is required",
        code: "MISSING_ID",
      });
    }

    if (name === undefined && location === undefined) {
      throw new BadRequestError({
        message: "At least one field (name or location) is required",
        code: "MISSING_UPDATE_FIELDS",
      });
    }

    const market = await MarketService.update({
      marketId: `${id}`,
      name,
      location,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, market, "Market updated successfully"));
  } catch (error: any) {
    if (error?.message === "Market not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error updating market:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE MARKET
export const deleteMarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Market ID is required",
        code: "MISSING_ID",
      });
    }

    await MarketService.delete(`${id}`);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Market deleted successfully"));
  } catch (error: any) {
    if (error?.message === "Market not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error deleting market:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET MARKET WITH LATEST PRICES
export const getMarketPrices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Market ID is required",
        code: "MISSING_ID",
      });
    }

    const data = await MarketService.getMarketWithPrices(`${id}`);

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Market prices fetched successfully"));
  } catch (error: any) {
    if (error?.message === "Market not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error fetching market prices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
