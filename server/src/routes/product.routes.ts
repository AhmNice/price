import express from "express";
import { createProduct, getProductById, getProductPrices, getProducts } from "../controller/products.controller";
import { validateRequest } from "../validation/validate";
import { createProductSchema } from "../validation/product.schema";

const ProductRouter = express.Router();

ProductRouter.post("/create", validateRequest(createProductSchema),  createProduct);
ProductRouter.get("/list", getProducts);
ProductRouter.get("/:id", getProductById);
ProductRouter.get("/:id/prices", getProductPrices);

export default ProductRouter;