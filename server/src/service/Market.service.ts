import prisma from "../config/database";

export class MarketService {
  // CREATE MARKET
  static async create({ name, location }: { name: string; location?: string }) {
    try {
      const market = await prisma.market.create({
        data: {
          name,
          location,
        },
      });

      return market;
    } catch (error) {
      throw error;
    }
  }

  // GET ALL MARKETS
  static async getAll() {
    try {
      return await prisma.market.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          prices: true,
          _count: {
            select: {
              prices: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // GET SINGLE MARKET
  static async getById(marketId: string) {
    try {
      const market = await prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      return market;
    } catch (error) {
      throw error;
    }
  }

  // UPDATE MARKET
  static async update({
    marketId,
    name,
    location,
  }: {
    marketId: string;
    name?: string;
    location?: string;
  }) {
    try {
      const existingMarket = await prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!existingMarket) {
        throw new Error("Market not found");
      }

      return await prisma.market.update({
        where: { id: marketId },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(location !== undefined ? { location } : {}),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // DELETE MARKET
  static async delete(marketId: string) {
    try {
      const existingMarket = await prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!existingMarket) {
        throw new Error("Market not found");
      }

      await prisma.market.delete({
        where: { id: marketId },
      });

      return {
        success: true,
        message: "Market deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  // GET MARKET WITH LATEST PRICES PER PRODUCT
  static async getMarketWithPrices(marketId: string) {
    try {
      const market = await prisma.market.findUnique({
        where: { id: marketId },
        include: {
          prices: {
            include: {
              product: true,
            },
            orderBy: {
              recordedAt: "desc",
            },
          },
        },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      const latestPricesMap = new Map();

      for (const price of market.prices) {
        if (!latestPricesMap.has(price.productId)) {
          latestPricesMap.set(price.productId, {
            productId: price.productId,
            productName: price.product.name,
            price: price.price,
            recordedAt: price.recordedAt,
          });
        }
      }

      return {
        id: market.id,
        name: market.name,
        location: market.location,
        prices: Array.from(latestPricesMap.values()),
      };
    } catch (error) {
      throw error;
    }
  }
}
