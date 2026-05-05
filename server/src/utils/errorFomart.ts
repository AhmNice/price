export const formatErrorMessage = (message: string) => {
  const cleanedMessage = message
    .replace(/"/g, "")
    .replace(/,/g, "")
    .replace(/body\./g, "")
    .replace(/query\./g, "")
    .replace(/params\./g, "")

    .replace(/expected one of /gi, "Choose from: ")
    .replace(/\|/g, ", ")
    .trim();

  return cleanedMessage.charAt(0).toUpperCase() + cleanedMessage.slice(1);
};
