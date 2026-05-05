import { Request, Response } from "express";
import { BadRequestError } from "../middleware/error.handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { WatchlistService } from "../service/WatchList.service.js";
import { UserService } from "../service/User.service.js";

//  ADD TO WATCHLIST
export const createWatchlist = async (req: Request, res: Response) => {
  try {
    const { userId, productId, targetPrice } = req.body;

    if (!userId || !productId) {
      throw new BadRequestError({
        message: "userId and productId are required",
        code: "MISSING_FIELDS",
      });
    }
    const user = await UserService.findById(`${userId}`);
    if (!user) {
      throw new BadRequestError({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    const watch = await WatchlistService.create({
      userId,
      productId,
      targetPrice,
    });

    res
      .status(201)
      .json(new ApiResponse(201, watch, "Added to watchlist successfully"));
  } catch (error: any) {
    console.error("Error creating watchlist:", error);

    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Product already in watchlist") {
      return res.status(400).json({ message: error.message });
    }

    throw error;
  }
};

//  GET USER WATCHLIST
export const getUserWatchlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError({
        message: "userId is required",
        code: "MISSING_USER_ID",
      });
    }

    const watchlist = await WatchlistService.getUserWatchlist(`${userId}`);

    res
      .status(200)
      .json(new ApiResponse(200, watchlist, "Watchlist fetched successfully"));
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  UPDATE TARGET PRICE
export const updateWatchlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetPrice } = req.body;

    if (!id) {
      throw new BadRequestError({
        message: "Watchlist ID is required",
        code: "MISSING_ID",
      });
    }

    if (targetPrice === undefined) {
      throw new BadRequestError({
        message: "targetPrice is required",
        code: "MISSING_TARGET_PRICE",
      });
    }

    const updated = await WatchlistService.updateTargetPrice({
      watchlistId: `${id}`,
      targetPrice,
    });

    res
      .status(200)
      .json(new ApiResponse(200, updated, "Watchlist updated successfully"));
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  REMOVE FROM WATCHLIST
export const deleteWatchlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError({
        message: "Watchlist ID is required",
        code: "MISSING_ID",
      });
    }

    await WatchlistService.remove(`${id}`);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Removed from watchlist successfully"));
  } catch (error) {
    console.error("Error deleting watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
