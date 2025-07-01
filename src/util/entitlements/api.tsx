export const addEntitlements = (
  params: URLSearchParams,
  isFineGrained: boolean | null,
  entitlements: string[],
) => {
  if (isFineGrained === null) {
    throw new Error("Resource API fetch disabled if isFineGrained is null");
  }

  if (!entitlements.length || !isFineGrained) {
    return "";
  }

  params.set("with-access-entitlements", entitlements.join(","));
};
