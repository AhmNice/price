import prisma from "../config/database.js";

type MarketSeed = {
  id: string;
  name: string;
  location?: string;
};

const marketSeeds: MarketSeed[] = [
  {
    id: "mkt-mile12",
    name: "Mile 12 Market",
    location: "Lagos",
  },
  {
    id: "mkt-oyingbo",
    name: "Oyingbo Market",
    location: "Lagos",
  },
  {
    id: "mkt-yaba",
    name: "Yaba Market",
    location: "Lagos",
  },
  {
    id: "mkt-ikeja",
    name: "Ikeja Market",
    location: "Lagos",
  },
  {
    id: "mkt-ajah",
    name: "Ajah Market",
    location: "Lagos",
  },
];

export async function seedMarkets() {
  const createdMarkets = [];

  for (const market of marketSeeds) {
    const result = await prisma.market.upsert({
      where: { id: market.id },
      update: {
        name: market.name,
        location: market.location,
      },
      create: {
        id: market.id,
        name: market.name,
        location: market.location,
      },
    });

    createdMarkets.push(result);
  }

  return createdMarkets;
}

async function main() {
  try {
    const markets = await seedMarkets();
    console.log(`Seeded ${markets.length} markets successfully.`);
  } catch (error) {
    console.error("Failed to seed markets:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

export async function runMarketSeed() {
  return main();
}