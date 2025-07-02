export const addEntitlements = (
  params: URLSearchParams,
  isFineGrained: boolean | null,
  entitlements: string[],
): void => {
  if (isFineGrained === null) {
    throw new Error("Resource API fetch disabled if isFineGrained is null");
  }

  if (entitlements.length && isFineGrained) {
    params.set("with-access-entitlements", entitlements.join(","));
  }
};
