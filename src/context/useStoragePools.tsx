import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import type {
  LxdStoragePool,
  LXDStoragePoolOnClusterMember,
} from "types/storage";
import {
  fetchPoolFromClusterMembers,
  fetchStoragePool,
  fetchStoragePools,
} from "api/storage-pools";
import { useClusterMembers } from "./useClusterMembers";

export const useStoragePool = (
  pool: string,
  target?: string,
  enabled?: boolean,
): UseQueryResult<LxdStoragePool> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.storage, pool, target],
    queryFn: () => fetchStoragePool(pool, isFineGrained, target),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useStoragePools = (
  enabled?: boolean,
): UseQueryResult<LxdStoragePool[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const usePoolFromClusterMembers = (
  pool: string,
): UseQueryResult<LXDStoragePoolOnClusterMember[]> => {
  const { isFineGrained } = useAuth();
  const { data: clusterMembers = [] } = useClusterMembers();
  return useQuery({
    queryKey: [queryKeys.storage, pool, queryKeys.cluster],
    queryFn: () =>
      fetchPoolFromClusterMembers(pool, clusterMembers, isFineGrained),
    enabled: isFineGrained !== null && clusterMembers.length > 0,
  });
};
