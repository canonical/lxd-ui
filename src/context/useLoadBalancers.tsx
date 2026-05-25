import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdLoadBalancer } from "types/loadBalancers";
import { fetchLoadBalancer, fetchLoadBalancers } from "api/load-balancers";

export const useLoadBalancers = (
  network: string,
  project: string,
): UseQueryResult<LxdLoadBalancer[]> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.loadBalancers,
    ],
    queryFn: async () => fetchLoadBalancers(network, project),
  });
};

export const useLoadBalancer = (
  network: string,
  project: string,
  listenAddress: string,
): UseQueryResult<LxdLoadBalancer> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.loadBalancers,
      listenAddress,
    ],
    queryFn: async () => fetchLoadBalancer(network, project, listenAddress),
  });
};
