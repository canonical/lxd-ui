import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  fetchNetwork,
  fetchNetworkFromClusterMembers,
  fetchNetworks,
  fetchNetworksFromClusterMembers,
} from "api/networks";
import { LxdNetwork, LXDNetworkOnClusterMember } from "types/network";
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
    queryFn: () => fetchNetworks(project, isFineGrained, target),
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
    queryFn: () => fetchNetwork(network, project, isFineGrained, target),
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
    queryFn: () =>
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
    queryFn: () =>
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
