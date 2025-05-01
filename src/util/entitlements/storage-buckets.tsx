import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdStorageBucket } from "types/storage";

export const useStorageBucketEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteBucket = (bucket?: LxdStorageBucket) =>
    hasEntitlement(isFineGrained, "can_delete", bucket?.access_entitlements);

  const canEditBucket = (bucket?: LxdStorageBucket) =>
    hasEntitlement(isFineGrained, "can_edit", bucket?.access_entitlements);

  return {
    canDeleteBucket,
    canEditBucket,
  };
};
