import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdProfile } from "types/profile";

export const useProfileEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteProfile = (profile?: LxdProfile) =>
    hasEntitlement(isFineGrained, "can_delete", profile?.access_entitlements);

  const canEditProfile = (profile?: LxdProfile) =>
    hasEntitlement(isFineGrained, "can_edit", profile?.access_entitlements);

  return {
    canDeleteProfile,
    canEditProfile,
  };
};
