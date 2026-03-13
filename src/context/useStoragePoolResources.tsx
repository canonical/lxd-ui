import { useQuery } from "@tanstack/react-query";
import { useClusteredStoragePoolResources } from "./useStoragePools";
import { useIsClustered } from "./useIsClustered";
import type { LxdStoragePool } from "types/storage";
import { isClusterLocalDriver } from "util/storagePool";
import type { LxdClusterMember } from "types/cluster";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePoolResources } from "api/storage-pools";

export const useStoragePoolResources = (
  pool?: LxdStoragePool,
  member?: LxdClusterMember,
) => {
  const isClustered = useIsClustered();
  const hasMemberSpecificSize =
    isClusterLocalDriver(pool?.driver ?? "") && isClustered;
  const clusteredQuery = useClusteredStoragePoolResources(
    pool?.name,
    member,
    hasMemberSpecificSize,
  );
  const nonlocalDriverOrUnclusteredQuery = useQuery({
    queryKey: [
      queryKeys.storage,
      pool?.name,
      queryKeys.resources,
      member?.server_name,
    ],
    queryFn: async () => fetchStoragePoolResources(pool?.name ?? ""),
    enabled: !!pool && !hasMemberSpecificSize,
  });

  return hasMemberSpecificSize
    ? clusteredQuery
    : nonlocalDriverOrUnclusteredQuery;
};
