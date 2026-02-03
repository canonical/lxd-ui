import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { fetchClusterMember, fetchClusterMembers } from "api/cluster-members";
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

export const useClusterMember = (
  name: string,
): UseQueryResult<LxdClusterMember> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members, name],
    queryFn: async () => fetchClusterMember(name),
    enabled: name !== "" && name !== "none",
  });
};
