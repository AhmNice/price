import prisma from "../config/database";

export class PriceService {
  // ADD PRICE
  static async addPrice({
    productId,
    marketId,
    price,
  }: {
    productId: string;
    marketId: string;
    price: number;
  }) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const market = await prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      const newPrice = await prisma.priceListing.create({
        data: {
          productId,
          marketId,
          price,
        },
      });
      await this.triggerAlertsForProduct(productId);
      return newPrice;
    } catch (error) {
      throw error;
    }
  }

  static async getLatestPricesByProduct(productId: string) {
    try {
      const prices = await prisma.priceListing.findMany({
        where: { productId },
        include: {
          market: true,
        },
        orderBy: {
          recordedAt: "desc",
        },
      });

      // pick latest per market
      const latestMap = new Map();

      for (const p of prices) {
        if (!latestMap.has(p.marketId)) {
          latestMap.set(p.marketId, {
            marketId: p.marketId,
            marketName: p.market.name,
            price: p.price,
            recordedAt: p.recordedAt,
          });
        }
      }

      return Array.from(latestMap.values());
    } catch (error) {
      throw error;
    }
  }

  static async getAllPrices() {
    try {
      return await prisma.priceListing.findMany({
        include: {
          product: true,
          market: true,
        },
        orderBy: {
          recordedAt: "desc",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getPriceById(id: string) {
    try {
      return await prisma.priceListing.findUnique({
        where: { id },
        include: {
          product: true,
          market: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updatePrice({ id, price }: { id: string; price: number }) {
    try {
      const existing = await prisma.priceListing.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("Price record not found");
      }

      return await prisma.priceListing.update({
        where: { id },
        data: { price },
        include: {
          product: true,
          market: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async deletePrice(id: string) {
    try {
      const existing = await prisma.priceListing.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("Price record not found");
      }

      await prisma.priceListing.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getPriceHistory(productId: string) {
    try {
      return await prisma.priceListing.findMany({
        where: { productId },
        include: {
          market: true,
          product:{
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          recordedAt: "desc",
        },
      });
    } catch (error) {
      throw error;
    }
  }
  static async insertMany(
    prices: { productId: string; marketId: string; price: number }[],
  ) {
    try {
      const result = await prisma.priceListing.createMany({
        data: prices,
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async checkPriceAlerts() {
    try {
      const watchlists = await prisma.watchlist.findMany({
        include: {
          product: true,
        },
      });

      const alerts: any[] = [];

      for (const watch of watchlists) {
        const latestPrices = await this.getLatestPricesByProduct(
          watch.productId,
        );

        for (const price of latestPrices) {
          if (watch.targetPrice && price.price <= watch.targetPrice) {
            alerts.push({
              userId: watch.userId,
              productId: watch.productId,
              currentPrice: price.price,
              targetPrice: watch.targetPrice,
              marketName: price.marketName,
            });
          }
        }
      }

      return alerts;
    } catch (error) {
      throw error;
    }
  }
  static async triggerAlertsForProduct(productId: string) {
    const watchlists = await prisma.watchlist.findMany({
      where: { productId },
    });

    const latestPrices = await this.getLatestPricesByProduct(productId);

    const alerts = [];

    for (const watch of watchlists) {
      for (const price of latestPrices) {
        if (watch.targetPrice && price.price <= watch.targetPrice) {
          alerts.push({
            userId: watch.userId,
            productId,
            currentPrice: price.price,
            marketName: price.marketName,
          });

          console.log("ALERT:", alerts[alerts.length - 1]);
        }
      }
    }

    return alerts;
  }
}
