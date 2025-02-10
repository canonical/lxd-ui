import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchSettingsFromClusterMembers, fetchSettings } from "api/server";
import type { LXDSettingOnClusterMember, LxdSettings } from "types/server";
import { UseQueryResult } from "@tanstack/react-query";
import { LxdClusterMember } from "types/cluster";

export const useSettings = (): UseQueryResult<LxdSettings> => {
  return useQuery({
    queryKey: [queryKeys.settings],
    queryFn: () => fetchSettings(),
  });
};

export const useClusteredSettings = (
  memberNames: LxdClusterMember[],
): UseQueryResult<LXDSettingOnClusterMember[]> => {
  return useQuery({
    queryKey: [queryKeys.settings, queryKeys.cluster],
    queryFn: () => fetchSettingsFromClusterMembers(memberNames),
    enabled: memberNames.length > 0,
  });
};
