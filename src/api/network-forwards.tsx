import { handleRawResponse, handleResponse } from "util/helpers";
import type { LxdNetwork, LxdNetworkForward } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";
import { addTarget } from "util/target";
import { ROOT_PATH } from "util/rootPath";

export const fetchNetworkForwards = async (
  network: string,
  project: string,
): Promise<LxdNetworkForward[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/forwards?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkForward[]>) => {
      return data.metadata.sort(
        (a, b) =>
          a.listen_address.localeCompare(b.listen_address) * 10 +
          (a.location && b.location ? a.location.localeCompare(b.location) : 0),
      );
    });
};

export const fetchNetworkForward = async (
  network: string,
  listenAddress: string,
  project: string,
  target?: string,
): Promise<LxdNetworkForward> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addTarget(params, target);

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/forwards/${encodeURIComponent(listenAddress)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkForward>) => {
      return data.metadata;
    });
};

export const createNetworkForward = async (
  network: string,
  forward: Partial<LxdNetworkForward>,
  project: string,
): Promise<string> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, forward.location);

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/forwards?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forward),
    },
  )
    .then(handleRawResponse)
    .then((response) => {
      const locationHeader = response.headers.get("Location");
      const listenAddress = locationHeader?.split("/").pop() ?? "";
      return listenAddress;
    });
};

export const updateNetworkForward = async (
  network: string,
  forward: LxdNetworkForward,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, forward.location);

  await fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network)}/forwards/${encodeURIComponent(forward.listen_address)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forward),
    },
  ).then(handleResponse);
};

export const deleteNetworkForward = async (
  network: LxdNetwork,
  forward: LxdNetworkForward,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, forward.location);

  await fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network.name)}/forwards/${encodeURIComponent(forward.listen_address)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};
