export const sanitizeISOAlias = (alias: string): string => {
  return alias.replace(/[^A-Za-z0-9.-]/g, "-");
};

export const isValidISOAlias = (alias: string): boolean => {
  return /^[A-Za-z0-9.-]+$/.test(alias) || !alias;
};
