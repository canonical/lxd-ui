import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  LxdStoragePool,
  LXDStoragePoolOnClusterMember,
  LxdStoragePoolResources,
} from "types/storage";
import {
  fetchClusteredStoragePoolResources,
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

export const useClusteredStoragePoolResources = (
  pool: string,
): UseQueryResult<LxdStoragePoolResources[]> => {
  const { data: clusterMembers = [] } = useClusterMembers();
  return useQuery({
    queryKey: [queryKeys.storage, pool, queryKeys.cluster, queryKeys.resources],
    queryFn: () => fetchClusteredStoragePoolResources(pool, clusterMembers),
    enabled: clusterMembers.length > 0,
  });
};
