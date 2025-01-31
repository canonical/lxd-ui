export const hasEntitlement = (
  entitlements: string[],
  required: string,
): boolean => {
  return entitlements.includes(required);
};
