import prisma from "../config/database";

export class AlertService {
  static async getUserAlerts(userId: string) {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    const alerts = [];

    for (const item of watchlist) {
      // get latest price for product
      const latestPrice = await prisma.priceListing.findFirst({
        where: { productId: item.productId },
        orderBy: { recordedAt: "desc" },
      });

      if (!latestPrice) continue;

      const triggered =item.targetPrice && latestPrice.price <= item.targetPrice;

      alerts.push({
        productName: item.product.name,
        targetPrice: item.targetPrice,
        currentPrice: latestPrice.price,
        triggered,
      });
    }

    return alerts;
  }
  static createAlert(userId: string, productId: string, targetPrice: number) {
    return prisma.watchlist.create({
      data: {
        userId,
        productId,
        targetPrice,
      },
    });
  }
}