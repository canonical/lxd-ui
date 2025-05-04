import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdWarning } from "types/warning";

export const useWarningEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteWarning = (warning?: LxdWarning) =>
    hasEntitlement(isFineGrained, "can_delete", warning?.access_entitlements);

  return {
    canDeleteWarning,
  };
};
