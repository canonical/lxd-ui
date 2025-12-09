import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useServerEntitlements } from "util/entitlements/server";
import { useIsClustered } from "./useIsClustered";
import { fetchResources, fetchClusterMembersResources } from "api/server";
import { useClusterMembers } from "./useClusterMembers";

export const useResources = (currentServerInCluster?: string) => {
  const isClustered = useIsClustered();
  const { data: clusterMembers = [] } = useClusterMembers();
  const { canViewResources } = useServerEntitlements();
  const singleNodeQuery = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: async () => fetchResources(),
    enabled: canViewResources() && !isClustered,
  });
  const filteredClusterMembers = clusterMembers.filter(
    (member) =>
      !currentServerInCluster || member.server_name === currentServerInCluster,
  );
  const clusterQuery = useQuery({
    queryKey: [queryKeys.resources, filteredClusterMembers],
    queryFn: async () => fetchClusterMembersResources(filteredClusterMembers),
    enabled: canViewResources() && isClustered,
  });

  return isClustered ? clusterQuery : singleNodeQuery;
};
