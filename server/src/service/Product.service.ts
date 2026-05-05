import prisma from "../config/database";

export class ProductService {
  // CREATE PRODUCT
  static async create({
    name,
    category,
  }: {
    name: string;
    category?: string;
  }) {
    try {
      const product = await prisma.product.create({
        data: {
          name,
          category,
        },
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  // GET ALL PRODUCTS
  static async getAll() {
    try {
      return await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // GET SINGLE PRODUCT
  static async getById(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  // GET PRODUCT WITH LATEST PRICES (IMPORTANT ONE)
  static async getProductWithPrices(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          prices: {
            include: {
              market: true,
            },
            orderBy: {
              recordedAt: "desc",
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // get latest price per market
      const latestPricesMap = new Map();

      for (const price of product.prices) {
        if (!latestPricesMap.has(price.marketId)) {
          latestPricesMap.set(price.marketId, {
            marketId: price.marketId,
            marketName: price.market.name,
            price: price.price,
            recordedAt: price.recordedAt,
          });
        }
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        prices: Array.from(latestPricesMap.values()),
      };
    } catch (error) {
      throw error;
    }
  }
}