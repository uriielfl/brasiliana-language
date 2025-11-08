export const isAlphabetic = (char: string): boolean => {
  return /[A-Za-zÀ-ÿ_]/.test(char);
};
