export const withEntitlementsQuery = (entitlements: string[]): string => {
  if (!entitlements.length) {
    return "";
  }

  return `with-access-entitlements=${entitlements.join(",")}`;
};
