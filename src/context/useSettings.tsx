import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchServerState, fetchSettings } from "api/server";
import type { LxdSettings } from "types/server";
import type { LxdClusterMemberState } from "types/cluster";

export const useSettings = (): UseQueryResult<LxdSettings> => {
  return useQuery({
    queryKey: [queryKeys.settings],
    queryFn: async () => fetchSettings(),
    staleTime: 60_000, // consider cache fresh for 1 minute to avoid excessive API calls
  });
};

export const useServerState = (
  enabled: boolean,
): UseQueryResult<LxdClusterMemberState> => {
  return useQuery({
    queryKey: [queryKeys.settings, queryKeys.state],
    queryFn: fetchServerState,
    enabled,
    refetchInterval: 15000,
  });
};
