
export const logInfo = (message: string, data?: any) => {
  console.log(`[INFO] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

export const logError = (message: string, error?: any) => {
  console.error(`[ERROR] ${message}`);
  if (error) console.error(error);
};