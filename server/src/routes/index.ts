import express from "express";
const router = express.Router();

import authRoute from "./auth.routes";
import healthRoute from "./health.route";
import marketRoute from "./market.routes";
import ProductRouter from "./product.routes";
import priceRoute from "./price.routes";
import watchRoute from "./watch.routes";

router.use("/auth", authRoute);
router.use("/markets", marketRoute);
router.use("/products", ProductRouter);
router.use("/prices", priceRoute);
router.use("/watchlist", watchRoute);

router.use("/health", healthRoute);

export default router;
