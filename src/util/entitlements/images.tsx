import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdImage } from "types/image";

export const useImageEntitlements = (image?: LxdImage) => {
  const { isFineGrained } = useAuth();

  const canDeleteImage = () =>
    hasEntitlement(isFineGrained, "can_delete", image?.access_entitlements);

  return {
    canDeleteImage,
  };
};
