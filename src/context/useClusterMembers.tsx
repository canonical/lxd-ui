import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchClusterMember, fetchClusterMembers } from "api/cluster-members";
import type {
  LxdClusterMember,
  LxdClusterMemberWithState,
} from "types/cluster";
import { useIsClustered } from "context/useIsClustered";

export const useClusterMembers = (): UseQueryResult<LxdClusterMember[]> => {
  const isClustered = useIsClustered();

  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: async () => fetchClusterMembers("1"),
    enabled: isClustered,
  });
};

export const useClusterMembersWithState = (): UseQueryResult<
  LxdClusterMemberWithState[]
> => {
  const isClustered = useIsClustered();

  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members, queryKeys.recursion, "2"],
    queryFn: async () => fetchClusterMembers("2"),
    enabled: isClustered,
    refetchInterval: 15000, // Refetch stats frequently
  });
};

export const useClusterMember = (
  name: string,
): UseQueryResult<LxdClusterMember> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members, name],
    queryFn: async () => fetchClusterMember(name),
    enabled: name !== "" && name !== "none",
    refetchInterval: 15000, // Refetch stats frequently
  });
};
