import prisma from "../config/database.js";

type PriceSeed = {
  productId: string;
  marketId: string;
  price: number;
  recordedAt: Date;
};

const markets = [
  "mkt-mile12",
  "mkt-oyingbo",
  "mkt-yaba",
  "mkt-ikeja",
];

const products = [
  "001f098e-94fd-4e28-a4f0-59b01a65739e", // Rice
  "prod-vegetable-oil-25l",
  "prod-palm-oil-25l",
  "prod-beans-50kg",
  "prod-garri-50kg",
  "prod-rice-50kg",
];

// helper to generate past dates
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export async function seedPrices() {
  const priceSeeds: PriceSeed[] = [];

  for (const productId of products) {
    for (const marketId of markets) {
      // create 3 historical prices per market
      priceSeeds.push(
        {
          productId,
          marketId,
          price: Math.floor(30000 + Math.random() * 20000),
          recordedAt: daysAgo(3),
        },
        {
          productId,
          marketId,
          price: Math.floor(30000 + Math.random() * 20000),
          recordedAt: daysAgo(2),
        },
        {
          productId,
          marketId,
          price: Math.floor(30000 + Math.random() * 20000),
          recordedAt: daysAgo(1),
        }
      );
    }
  }

  // insert all
  for (const seed of priceSeeds) {
    await prisma.priceListing.create({
      data: seed,
    });
  }

  console.log(`Seeded ${priceSeeds.length} price records`);
}