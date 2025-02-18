import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  fetchNetwork,
  fetchNetworkOnMember,
  fetchNetworks,
  fetchNetworksOnMember,
} from "api/networks";
import { LxdNetwork } from "types/network";

export const useNetworks = (
  project: string,
  target?: string,
  enabled?: boolean,
): UseQueryResult<LxdNetwork[]> => {
  const { isFineGrained } = useAuth();
  const queryFn = target
    ? () => fetchNetworksOnMember(project, target, isFineGrained)
    : () => fetchNetworks(project, isFineGrained);

  const queryKey = [queryKeys.projects, project, queryKeys.networks];
  if (target) {
    queryKey.push(queryKeys.members);
    queryKey.push(target);
  }

  return useQuery({
    queryKey,
    queryFn: queryFn,
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
  const queryFn = target
    ? () => fetchNetworkOnMember(network, project, target, isFineGrained)
    : () => fetchNetwork(network, project, isFineGrained);

  const queryKey = [queryKeys.projects, project, queryKeys.networks, network];
  if (target) {
    queryKey.push(queryKeys.members);
    queryKey.push(target);
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
