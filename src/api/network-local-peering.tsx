import { handleResponse } from "util/helpers";
import type { LxdNetworkPeer } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchNetworkPeers = async (
  network: string,
  project: string,
): Promise<LxdNetworkPeer[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `/1.0/networks/${encodeURIComponent(network)}/peers?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkPeer[]>) => {
      data.metadata.sort((a, b) => a.name.localeCompare(b.name));
      return data.metadata;
    });
};

export const fetchNetworkPeer = async (
  network: string,
  project: string,
  localPeering: string,
): Promise<LxdNetworkPeer> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/networks/${encodeURIComponent(network)}/peers/${encodeURIComponent(localPeering)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkPeer>) => {
      return data.metadata;
    });
};

export const createNetworkPeer = async (
  network: string,
  project: string,
  body: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/networks/${encodeURIComponent(network)}/peers?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    },
  ).then(handleResponse);
};

export const deleteNetworkPeer = async (
  network: string,
  project: string,
  localPeering: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/networks/${encodeURIComponent(
      network,
    )}/peers/${encodeURIComponent(localPeering)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const updateNetworkPeer = async (
  network: string,
  localPeering: string,
  project: string,
  body: LxdNetworkPeer,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/networks/${encodeURIComponent(network)}/peers/${encodeURIComponent(localPeering)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  ).then(handleResponse);
};
