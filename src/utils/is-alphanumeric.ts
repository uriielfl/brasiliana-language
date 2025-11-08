export const isAlphanumeric = (char: string): boolean => {
  return /[A-Za-zÀ-ÿ0-9_]/.test(char);
};
