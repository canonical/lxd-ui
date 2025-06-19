import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import {
  fetchAllStorageBuckets,
  fetchStorageBucket,
  fetchStorageBucketKey,
  fetchStorageBucketKeys,
} from "api/storage-buckets";

export const useBuckets = (
  project: string,
): UseQueryResult<LxdStorageBucket[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.storage, project, queryKeys.buckets],
    queryFn: async () => fetchAllStorageBuckets(isFineGrained, project),
  });
};

export const useBucket = (
  bucketName: string,
  pool: string,
  project: string,
  target?: string,
): UseQueryResult<LxdStorageBucket> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [
      queryKeys.storage,
      pool,
      project,
      queryKeys.buckets,
      bucketName,
      target,
    ],
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

export const useBucketKey = (
  bucket: LxdStorageBucket,
  keyName: string,
  project: string,
): UseQueryResult<LxdStorageBucketKey> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [
      queryKeys.storage,
      bucket.pool,
      project,
      queryKeys.buckets,
      bucket.name,
      queryKeys.keys,
      keyName,
    ],
    queryFn: async () =>
      fetchStorageBucketKey(bucket, keyName, isFineGrained, project),
  });
};

export const useBucketKeys = (
  bucket: LxdStorageBucket,
  project: string,
): UseQueryResult<LxdStorageBucketKey[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [
      queryKeys.storage,
      bucket.pool,
      project,
      queryKeys.buckets,
      bucket.name,
      queryKeys.keys,
    ],
    queryFn: async () => fetchStorageBucketKeys(bucket, isFineGrained, project),
  });
};
