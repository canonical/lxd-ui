import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";

export const useServerEntitlements = () => {
  const { isFineGrained, serverEntitlements } = useAuth();

  const canEditServer = () =>
    hasEntitlement(isFineGrained, "can_edit", serverEntitlements);

  return {
    canEditServer,
  };
};
