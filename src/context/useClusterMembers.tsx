import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { fetchClusterMembers } from "api/cluster";
import type { LxdClusterMember } from "types/cluster";
import { useIsClustered } from "context/useIsClustered";

export const useClusterMembers = (): UseQueryResult<LxdClusterMember[]> => {
  const isClustered = useIsClustered();

  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
    enabled: isClustered,
  });
};
