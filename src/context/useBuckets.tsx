import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import {
  fetchAllStorageBuckets,
  fetchStorageBucket,
  fetchStorageBucketKeys,
} from "api/storage-buckets";

export const useLoadBuckets = (
  project: string,
): UseQueryResult<LxdStorageBucket[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.buckets, project],
    queryFn: async () => fetchAllStorageBuckets(isFineGrained, project),
  });
};

export const useStorageBucket = (
  bucketName: string,
  pool: string,
  project: string,
  target?: string,
): UseQueryResult<LxdStorageBucket> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.storage, pool, project, bucketName, target],
    queryFn: async () =>
      fetchStorageBucket(
        pool,
        project,
        bucketName,
        isFineGrained,
        target ?? null,
      ),
  });
};

export const useBucketKeys = (
  bucket: LxdStorageBucket,
  project: string,
): UseQueryResult<LxdStorageBucketKey[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.buckets, project, queryKeys.bucketKeys],
    queryFn: async () => fetchStorageBucketKeys(bucket, isFineGrained, project),
  });
};
