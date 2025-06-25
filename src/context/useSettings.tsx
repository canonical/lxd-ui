import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchSettingsFromClusterMembers, fetchSettings } from "api/server";
import type { LXDSettingOnClusterMember, LxdSettings } from "types/server";
import type { UseQueryResult } from "@tanstack/react-query";
import { useClusterMembers } from "./useClusterMembers";

export const useSettings = (): UseQueryResult<LxdSettings> => {
  return useQuery({
    queryKey: [queryKeys.settings],
    queryFn: async () => fetchSettings(),
  });
};

export const useClusteredSettings = (): UseQueryResult<
  LXDSettingOnClusterMember[]
> => {
  const { data: clusterMembers = [] } = useClusterMembers();

  return useQuery({
    queryKey: [queryKeys.settings, queryKeys.cluster],
    queryFn: async () => fetchSettingsFromClusterMembers(clusterMembers),
    enabled: clusterMembers.length > 0,
    retry: false,
  });
};
