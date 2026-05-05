import prisma from "../config/database.js";

type ProductSeed = {
  id: string;
  name: string;
  category?: string;
};

const productSeeds: ProductSeed[] = [
  {
    id: "prod-rice-50kg",
    name: "Rice (50kg Bag)",
    category: "Food Staples",
  },
  {
    id: "prod-garri-50kg",
    name: "Garri (50kg Bag)",
    category: "Food Staples",
  },
  {
    id: "prod-beans-50kg",
    name: "Beans (50kg Bag)",
    category: "Food Staples",
  },
  {
    id: "prod-palm-oil-25l",
    name: "Palm Oil (25 Litres)",
    category: "Cooking",
  },
  {
    id: "prod-vegetable-oil-25l",
    name: "Vegetable Oil (25 Litres)",
    category: "Cooking",
  },
];
export async function seedProducts() {
  const createdProducts = [];

  for (const product of productSeeds) {
    const result = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        category: product.category,
      },
      create: {
        id: product.id,
        name: product.name,
        category: product.category,
      },
    });

    createdProducts.push(result);
  }

  return createdProducts;
}

async function main() {
  try {
    const products = await seedProducts();
    console.log(`Seeded ${products.length} products successfully.`);
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
export async function runProductSeed() {
  return main();
}
