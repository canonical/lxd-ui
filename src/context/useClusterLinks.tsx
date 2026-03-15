import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  fetchClusterLink,
  fetchClusterLinks,
  fetchClusterLinkState,
} from "api/cluster-links";
import type { LxdClusterLink, LxdClusterLinkState } from "types/cluster";
import { useAuth } from "context/auth";

export const useClusterLinks = (): UseQueryResult<LxdClusterLink[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.links],
    queryFn: async () => fetchClusterLinks(isFineGrained),
  });
};

export const useClusterLink = (
  link: string,
): UseQueryResult<LxdClusterLink> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.links, link],
    queryFn: async () => fetchClusterLink(link, isFineGrained),
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
