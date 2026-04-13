import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdImage, LxdImageRegistry } from "types/image";

export const useImageEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteImage = (image?: LxdImage) =>
    hasEntitlement(isFineGrained, "can_delete", image?.access_entitlements);

  return {
    canDeleteImage,
  };
};

export const useImageRegistriesEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteImageRegistry = (imageRegistry: LxdImageRegistry) =>
    hasEntitlement(
      isFineGrained,
      "can_delete",
      imageRegistry?.access_entitlements,
    );
  const canEditImageRegistry = (imageRegistry: LxdImageRegistry) =>
    hasEntitlement(
      isFineGrained,
      "can_edit",
      imageRegistry?.access_entitlements,
    );

  return {
    canDeleteImageRegistry,
    canEditImageRegistry,
  };
};
