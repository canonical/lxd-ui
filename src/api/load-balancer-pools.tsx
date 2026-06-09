import { handleResponse } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { ROOT_PATH } from "util/rootPath";
import type {
  LxdLoadBalancerPool,
  LxdLoadBalancerPoolStatus,
} from "types/loadBalancers";

export const fetchLoadBalancerPools = async (
  network: string,
  project: string,
): Promise<LxdLoadBalancerPool[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancer-pools?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdLoadBalancerPool[]>) => {
      return data.metadata;
    });
};

export const fetchLoadBalancerPool = async (
  network: string,
  project: string,
  pool: string,
): Promise<LxdLoadBalancerPool> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancer-pools/${encodeURIComponent(pool)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdLoadBalancerPool>) => {
      return data.metadata;
    });
};

export const fetchLoadBalancerPoolState = async (
  network: string,
  project: string,
  pool: string,
): Promise<LxdLoadBalancerPoolStatus> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancer-pools/${encodeURIComponent(pool)}/state?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdLoadBalancerPoolStatus>) => {
      return data.metadata;
    });
};

export const createLoadBalancerPool = async (
  network: string,
  project: string,
  pool: LxdLoadBalancerPool,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancer-pools?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pool),
    },
  ).then(handleResponse);
};

export const updateLoadBalancerPool = async (
  network: string,
  project: string,
  pool: LxdLoadBalancerPool,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancer-pools/${encodeURIComponent(pool.name)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pool),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteLoadBalancerPool = async (
  network: string,
  project: string,
  pool: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancer-pools/${encodeURIComponent(pool)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};
