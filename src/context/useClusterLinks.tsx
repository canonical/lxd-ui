import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  fetchClusterLink,
  fetchClusterLinks,
  fetchClusterLinkState,
} from "api/cluster-links";
import type { LxdClusterLink, LxdClusterLinkState } from "types/cluster";

export const useClusterLinks = (): UseQueryResult<LxdClusterLink[]> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.links],
    queryFn: fetchClusterLinks,
  });
};

export const useClusterLink = (
  link: string,
): UseQueryResult<LxdClusterLink> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.links, link],
    queryFn: async () => fetchClusterLink(link),
  });
};

export const useClusterLinkState = (
  link: string,
): UseQueryResult<LxdClusterLinkState> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.links, link, queryKeys.state],
    queryFn: async () => fetchClusterLinkState(link),
  });
};
