import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { LxdStorageBucket } from "types/storage";
import { fetchAllStorageBuckets } from "api/storage-buckets";

export const useLoadBuckets = (
  project: string,
): UseQueryResult<LxdStorageBucket[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.buckets, project],
    queryFn: async () => fetchAllStorageBuckets(isFineGrained, project),
  });
};
