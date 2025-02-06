export const hasEntitlement = (
  isFineGrained: boolean | null,
  entitlement: string,
  grantedEntitlements?: string[],
): boolean => {
  // if isFineGrained is null, we are still awaiting the api response to determine if the user has fine grained entitlements
  // in this case, we should grant access to the user assuming they have sufficient permission
  if (isFineGrained === null) {
    return true;
  }

  return !isFineGrained || (grantedEntitlements || []).includes(entitlement);
};

export const hasEntitlementSet = (
  isFineGrained: boolean | null,
  entitlement: string,
  resources: { name: string; access_entitlements?: string[] }[],
) => {
  const result = new Set<string>();
  for (const resource of resources) {
    if (
      hasEntitlement(isFineGrained, entitlement, resource?.access_entitlements)
    ) {
      result.add(resource.name);
    }
  }
  return result;
};
