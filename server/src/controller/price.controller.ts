import { Request, Response } from "express";

import { BadRequestError } from "../middleware/error.handler.js";
import { PriceService } from "../service/Price.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addPrice = async (req: Request, res: Response) => {
  try {
    const { productId, marketId, price } = req.body;

    if (!productId || !marketId || price === undefined) {
      throw new BadRequestError({
        message: "productId, marketId and price are required",
        code: "MISSING_FIELDS",
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      throw new BadRequestError({
        message: "price must be a positive number",
        code: "INVALID_PRICE",
      });
    }

    const created = await PriceService.addPrice({
      productId,
      marketId,
      price: numericPrice,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, created, "Price added successfully"));
  } catch (error: any) {
    if (
      error?.message === "Product not found" ||
      error?.message === "Market not found"
    ) {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error adding price:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const addMultiplePrices = async (req: Request, res: Response) => {
  try {
    const { prices } = req.body;
    

    if (!Array.isArray(prices) || prices.length === 0) {
      throw new BadRequestError({
        message: "prices must be a non-empty array",
        code: "INVALID_PRICES_ARRAY",
      });
    }
    const numericPrices = prices.map((p: any, index: number) => {
      if (!p.productId || !p.marketId || p.price === undefined) {
        throw new BadRequestError({
          message: `Invalid price entry at index ${index}`,
          code: "INVALID_PRICE_ENTRY",
        });
      }

      const numericPrice = Number(p.price);
      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        throw new BadRequestError({
          message: `Invalid price at index ${index}`,
          code: "INVALID_PRICE",
        });
      }

      return {
        productId: p.productId,
        marketId: p.marketId,
        price: numericPrice,
      };
    });

    const result = await PriceService.insertMany(numericPrices);

    return res
      .status(201)
      .json(new ApiResponse(201, result, "Prices added successfully"));
  } catch (error: any) {
    console.error("Error adding multiple prices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getPrices = async (_req: Request, res: Response) => {
  try {
    const prices = await PriceService.getAllPrices();

    return res
      .status(200)
      .json(new ApiResponse(200, prices, "Prices fetched successfully"));
  } catch (error) {
    console.error("Error fetching prices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPriceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError({
        message: "Price ID is required",
        code: "MISSING_ID",
      });
    }

    const price = await PriceService.getPriceById(`${id}`);

    if (!price) {
      return res.status(404).json({ message: "Price record not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, price, "Price fetched successfully"));
  } catch (error) {
    console.error("Error fetching price by id:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!id) {
      throw new BadRequestError({
        message: "Price ID is required",
        code: "MISSING_ID",
      });
    }

    if (price === undefined) {
      throw new BadRequestError({
        message: "price is required",
        code: "MISSING_PRICE",
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      throw new BadRequestError({
        message: "price must be a positive number",
        code: "INVALID_PRICE",
      });
    }

    const updated = await PriceService.updatePrice({
      id: `${id}`,
      price: numericPrice,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Price updated successfully"));
  } catch (error: any) {
    if (error?.message === "Price record not found") {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error updating price:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Price ID is required",
        code: "MISSING_ID",
      });
    }

    await PriceService.deletePrice(`${id}`);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Price deleted successfully"));
  } catch (error: any) {
    if (error?.message === "Price record not found") {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error deleting price:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLatestProductPrices = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw new BadRequestError({
        message: "productId is required",
        code: "MISSING_PRODUCT_ID",
      });
    }

    const prices = await PriceService.getLatestPricesByProduct(`${productId}`);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          prices,
          "Latest product prices fetched successfully",
        ),
      );
  } catch (error) {
    console.error("Error fetching latest product prices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductPriceHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw new BadRequestError({
        message: "productId is required",
        code: "MISSING_PRODUCT_ID",
      });
    }

    const history = await PriceService.getPriceHistory(`${productId}`);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          history,
          "Product price history fetched successfully",
        ),
      );
  } catch (error) {
    console.error("Error fetching product price history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
