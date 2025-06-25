import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  fetchClusterGroup,
  fetchClusterGroups,
  fetchClusterMember,
  fetchClusterMembers,
} from "api/cluster";
import type { LxdClusterGroup, LxdClusterMember } from "types/cluster";
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
  });
};

export const useClusterGroups = (): UseQueryResult<LxdClusterGroup[]> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups],
    queryFn: async () => fetchClusterGroups(),
  });
};

export const useClusterGroup = (
  group: string,
): UseQueryResult<LxdClusterGroup> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups, group],
    queryFn: async () => fetchClusterGroup(group),
  });
};
