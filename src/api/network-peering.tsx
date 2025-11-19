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
      return data.metadata;
    });
};
