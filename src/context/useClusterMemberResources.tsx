import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchResources } from "api/server";

export const useClusterMemberResources = (serverName?: string) => {
  return useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      serverName ?? undefined,
      queryKeys.resources,
    ],
    queryFn: async () => fetchResources(serverName),
  });
};
