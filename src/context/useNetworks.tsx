import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  fetchNetwork,
  fetchNetworkFromClusterMembers,
  fetchNetworks,
  fetchNetworksFromClusterMembers,
  fetchNetworkState,
} from "api/networks";
import type { LxdNetwork, LXDNetworkOnClusterMember } from "types/network";
import { useClusterMembers } from "./useClusterMembers";

export const useNetworks = (
  project: string,
  target?: string,
  enabled?: boolean,
): UseQueryResult<LxdNetwork[]> => {
  const { isFineGrained } = useAuth();

  const queryKey = [queryKeys.projects, project, queryKeys.networks];
  if (target) {
    queryKey.push(queryKeys.members);
    queryKey.push(target);
  }

  return useQuery({
    queryKey,
    queryFn: async () => fetchNetworks(project, isFineGrained, target),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useNetwork = (
  network: string,
  project: string,
  target?: string,
  enabled?: boolean,
): UseQueryResult<LxdNetwork> => {
  const { isFineGrained } = useAuth();

  const queryKey = [queryKeys.projects, project, queryKeys.networks, network];
  if (target) {
    queryKey.push(queryKeys.members);
    queryKey.push(target);
  }

  return useQuery({
    queryKey,
    queryFn: async () => fetchNetwork(network, project, isFineGrained, target),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useNetworksFromClusterMembers = (
  project: string,
): UseQueryResult<LXDNetworkOnClusterMember[]> => {
  const { isFineGrained } = useAuth();
  const { data: clusterMembers = [] } = useClusterMembers();

  return useQuery({
    queryKey: [queryKeys.networks, project, queryKeys.cluster],
    queryFn: async () =>
      fetchNetworksFromClusterMembers(project, clusterMembers, isFineGrained),
    enabled: isFineGrained !== null && clusterMembers.length > 0,
  });
};

export const useNetworkFromClusterMembers = (
  network: string,
  project: string,
  enabled?: boolean,
): UseQueryResult<LXDNetworkOnClusterMember[]> => {
  const { isFineGrained } = useAuth();
  const { data: clusterMembers = [] } = useClusterMembers();

  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.cluster,
    ],
    queryFn: async () =>
      fetchNetworkFromClusterMembers(
        network,
        project,
        clusterMembers,
        isFineGrained,
      ),
    enabled:
      (enabled ?? true) && isFineGrained !== null && clusterMembers.length > 0,
  });
};

export const useNetworkState = (
  networkName: string,
  project: string,
  member?: string,
  enabled?: boolean,
) => {
  const { isFineGrained } = useAuth();

  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      networkName,
      queryKeys.members,
      member,
      queryKeys.state,
    ],
    retry: 0, // physical managed networks can sometimes 404, show error right away and don't retry
    queryFn: async () => fetchNetworkState(networkName, project, member),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
