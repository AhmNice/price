import { Request, Response } from "express";
import { BadRequestError } from "../middleware/error.handler.js";
import { ProductService } from "../service/Product.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      throw new BadRequestError({
        message: "Name is required",
        code: "MISSING_NAME",
      });
    }

    const product = await ProductService.create({ name, category });

    res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await ProductService.getAll();

    res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Product ID is required",
        code: "MISSING_ID",
      });
    }

    const product = await ProductService.getProductWithPrices(`${id}`);

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  GET PRODUCT WITH PRICE COMPARISON (IMPORTANT)
export const getProductPrices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Product ID is required",
        code: "MISSING_ID",
      });
    }

    const data = await ProductService.getProductWithPrices(`${id}`);

    res
      .status(200)
      .json(new ApiResponse(200, data, "Product prices fetched successfully"));
  } catch (error) {
    console.error("Error fetching product prices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};