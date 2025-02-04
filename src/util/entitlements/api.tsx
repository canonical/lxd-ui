export const withEntitlementsQuery = (
  isFineGrained: boolean | null,
  entitlements: string[],
): string => {
  if (isFineGrained === null) {
    throw new Error("Resource API fetch disabled if isFineGrained is null");
  }

  if (!entitlements.length || !isFineGrained) {
    return "";
  }

  return `with-access-entitlements=${entitlements.join(",")}`;
};
