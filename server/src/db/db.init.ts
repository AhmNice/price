import { createDatabase } from "./db.setup";


export async function initializeDatabase() {
  const { databaseCreated, db_url } = await createDatabase();
  if (databaseCreated) {
    console.log("Database setup completed successfully.");
  } else {
    console.log("Database already exists. No setup needed.");
  }
  console.log(`Database URL: ${db_url}`);
}

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});