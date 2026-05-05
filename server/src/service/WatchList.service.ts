import prisma from "../config/database";
import { NotFoundError } from "../middleware/error.handler";

export class WatchlistService {
  static async create({
    userId,
    productId,
    targetPrice,
  }: {
    userId: string;
    productId: string;
    targetPrice?: number;
  }) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const existing = await prisma.watchlist.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existing) {
        throw new Error("Product already in watchlist");
      }

      const watch = await prisma.watchlist.create({
        data: {
          userId,
          productId,
          targetPrice,
        },
      });

      return watch;
    } catch (error) {
      throw error;
    }
  }

  static async getUserWatchlist(userId: string) {
    try {
      return await prisma.watchlist.findMany({
        where: { userId },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateTargetPrice({
    watchlistId,
    targetPrice,
  }: {
    watchlistId: string;
    targetPrice: number;
  }) {
    try {
      const existing = await prisma.watchlist.findUnique({
        where: { id: watchlistId },
        select: { id: true },
      });
      if (!existing) {
        throw new NotFoundError({ message: "Watchlist item not found" });
      }
      const watch = await prisma.watchlist.update({
        where: { id: watchlistId },
        data: {
          targetPrice,
        },
      });

      return watch;
    } catch (error) {
      throw error;
    }
  }

  static async remove(watchlistId: string) {
    try {
      return await prisma.watchlist.delete({
        where: { id: watchlistId },
      });
    } catch (error) {
      throw error;
    }
  }
}
