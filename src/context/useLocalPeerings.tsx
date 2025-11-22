import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { LxdNetwork, LxdNetworkPeer } from "types/network";
import { fetchNetworkPeer, fetchNetworkPeers } from "api/network-local-peering";

export const useLocalPeerings = (
  network: LxdNetwork,
  project: string,
): UseQueryResult<LxdNetworkPeer[]> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.peers,
    ],
    queryFn: async () => fetchNetworkPeers(network.name, project),
  });
};

export const useLocalPeering = (
  network: LxdNetwork,
  project: string,
  localPeering: string,
): UseQueryResult<LxdNetworkPeer> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.peers,
      localPeering,
    ],
    queryFn: async () => fetchNetworkPeer(network.name, project, localPeering),
  });
};
