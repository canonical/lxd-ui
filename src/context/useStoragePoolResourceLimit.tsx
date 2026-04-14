import type { LxdStoragePool } from "types/storage";
import { useClusterMember } from "./useClusterMembers";
import { useStoragePoolResources } from "./useStoragePoolResources";
import { useNotify } from "@canonical/react-components";
import { getResourceLimit } from "util/resourceLimits";
import { ensureArray } from "util/helpers";

export const useStoragePoolResourceLimit = (
  pool?: LxdStoragePool,
  clusterMemberName?: string,
) => {
  const notify = useNotify();
  const { data: clusterMember } = useClusterMember(clusterMemberName ?? "");
  const {
    data: resources,
    isLoading,
    error,
  } = useStoragePoolResources(pool, clusterMember);

  if (error) {
    notify.failure("Loading resources failed", error);
    return null;
  }

  if (isLoading || !resources) {
    return null;
  }

  const resourceArray = ensureArray(resources);
  const availableSpaces = resourceArray.map(
    (r) => r.space.total - (r.space.used ?? 0),
  );
  return getResourceLimit(
    availableSpaces,
    !clusterMemberName || clusterMemberName === "none" ? "" : clusterMemberName,
  );
};
