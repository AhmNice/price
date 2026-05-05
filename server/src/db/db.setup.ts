import config from "../config/config";
import { defaultPool } from "../config/db.config";
import format from "pg-format";
import { isPgDuplicateDatabaseError, validateDatabaseName } from "./db.helper";
interface DBSetupResult {
  databaseCreated: boolean;
  db_url: string;
}
export async function createDatabase(): Promise<DBSetupResult> {
  try {
    validateDatabaseName(config.DB_NAME);
    const saveDbName = format.ident(config.DB_NAME);
    await defaultPool.query(`CREATE DATABASE ${saveDbName}`);
    console.log(`Database ${config.DB_NAME} created successfully.`);
    return {
      databaseCreated: true,
      db_url: `postgresql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`
    };
  } catch (error: unknown) {
    if (isPgDuplicateDatabaseError(error)) {
      console.log(
        `Database ${config.DB_NAME} already exists. Skipping creation.`,
      );
      return {
        databaseCreated: false,
        db_url: `postgresql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`
      };
    } else {
      console.error("Error creating database:", error);
      throw error;
    }
  }
}
