import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query/src/types";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";
import { fetchClusterMembers } from "api/cluster";
import { LxdClusterMember } from "types/cluster";

export const useClusterMembers = (): UseQueryResult<LxdClusterMember[]> => {
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);

  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
    enabled: isClustered,
  });
};
