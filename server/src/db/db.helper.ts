export function isPgDuplicateDatabaseError(
  error: unknown,
): error is { code: string } {
  if (typeof error !== "object" || error === null) return false;
  const maybeCode = (error as Record<string, unknown>)["code"];
  return maybeCode === "42P04";
}
export function validateDatabaseName(dbName: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) {
    throw new Error(`Invalid database name: ${dbName}`);
  }
}
