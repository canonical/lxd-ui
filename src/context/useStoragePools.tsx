import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { LxdStoragePool } from "types/storage";
import { fetchStoragePool, fetchStoragePools } from "api/storage-pools";

export const useStoragePool = (
  pool: string,
  target?: string,
  enabled?: boolean,
): UseQueryResult<LxdStoragePool> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.storage, pool, target],
    queryFn: () => fetchStoragePool(pool, target, isFineGrained),
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
