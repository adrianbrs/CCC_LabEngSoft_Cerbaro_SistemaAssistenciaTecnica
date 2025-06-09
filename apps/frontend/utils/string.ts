export const sanitizeNumberStr = (value: string): string =>
  value.replace(/\D/g, "");
