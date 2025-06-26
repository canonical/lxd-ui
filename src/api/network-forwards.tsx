import { handleRawResponse, handleResponse } from "util/helpers";
import type { LxdNetwork, LxdNetworkForward } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchNetworkForwards = async (
  network: string,
  project: string,
): Promise<LxdNetworkForward[]> => {
  return fetch(
    `/1.0/networks/${network}/forwards?project=${project}&recursion=1`,
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
  location?: string,
): Promise<LxdNetworkForward> => {
  const target = location ? `&target=${location}` : "";
  return fetch(
    `/1.0/networks/${network}/forwards/${listenAddress}?project=${project}&recursion=1${target}`,
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
  const target = forward.location ? `&target=${forward.location}` : "";
  return fetch(
    `/1.0/networks/${network}/forwards?project=${project}${target}`,
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
  forward: Partial<LxdNetworkForward>,
  project: string,
): Promise<void> => {
  const target = forward.location ? `&target=${forward.location}` : "";
  await fetch(
    `/1.0/networks/${network}/forwards/${forward.listen_address}?project=${project}${target}`,
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
  const target = forward.location ? `&target=${forward.location}` : "";
  await fetch(
    `/1.0/networks/${network.name}/forwards/${forward.listen_address}?project=${project}${target}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};
