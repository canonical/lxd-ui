import { handleResponse } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { ROOT_PATH } from "util/rootPath";
import type { LxdLoadBalancer } from "types/loadBalancers";

export const fetchLoadBalancers = async (
  network: string,
  project: string,
): Promise<LxdLoadBalancer[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancers?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdLoadBalancer[]>) => {
      return data.metadata.sort((a, b) =>
        a.listen_address.localeCompare(b.listen_address),
      );
    });
};

export const fetchLoadBalancer = async (
  network: string,
  project: string,
  listenAddress: string,
): Promise<LxdLoadBalancer> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancers/${encodeURIComponent(listenAddress)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdLoadBalancer>) => {
      return data.metadata;
    });
};

export const updateLoadBalancer = async (
  network: string,
  project: string,
  loadBalancer: LxdLoadBalancer,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancers/${encodeURIComponent(loadBalancer.listen_address)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loadBalancer),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const createLoadBalancer = async (
  network: string,
  project: string,
  loadBalancer: Partial<LxdLoadBalancer>,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancers?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loadBalancer),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteLoadBalancer = async (
  network: string,
  project: string,
  loadBalancer: LxdLoadBalancer,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/load-balancers/${encodeURIComponent(loadBalancer.listen_address)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};
