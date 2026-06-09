import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  fetchLoadBalancerPool,
  fetchLoadBalancerPools,
  fetchLoadBalancerPoolState,
} from "api/load-balancer-pools";
import type {
  LxdLoadBalancerPool,
  LxdLoadBalancerPoolStatus,
} from "types/loadBalancers";

export const useLoadBalancerPools = (
  network: string,
  project: string,
): UseQueryResult<LxdLoadBalancerPool[]> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.loadBalancerPools,
    ],
    queryFn: async () => fetchLoadBalancerPools(network, project),
  });
};

export const useLoadBalancerPool = (
  network: string,
  project: string,
  pool: string,
): UseQueryResult<LxdLoadBalancerPool> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.loadBalancerPools,
      pool,
    ],
    queryFn: async () => fetchLoadBalancerPool(network, project, pool),
  });
};

export const useLoadBalancerPoolState = (
  network: string,
  project: string,
  pool: string,
): UseQueryResult<LxdLoadBalancerPoolStatus> => {
  return useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.loadBalancerPools,
      pool,
      queryKeys.state,
    ],
    queryFn: async () => fetchLoadBalancerPoolState(network, project, pool),
  });
};
