import { seedMarkets } from "./market.seed";
import { seedPrices } from "./price.seed";
import { seedProducts } from "./product.seed";
import { seedUsers } from "./user.seed";

async function runSeeds() {
  console.log("Seeding markets...");
  try {
    await seedMarkets();
    await seedProducts();
    await seedUsers();
    await seedPrices();
    console.log("All seeds completed successfully.");
  } catch (error) {
    console.error("Failed to run seeds:", error);
  }
}

runSeeds().catch((error) => {
  console.error("Unexpected error during seeding:", error);
  process.exit(1);
});
