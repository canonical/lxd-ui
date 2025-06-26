import { handleResponse } from "util/helpers";
import type { LxdNetworkLease } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchNetworkLeases = async (
  network: string,
  project: string,
): Promise<LxdNetworkLease[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(
    `/1.0/networks/${encodeURIComponent(network)}/leases?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkLease[]>) => {
      return data.metadata;
    });
};
