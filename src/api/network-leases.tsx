import { handleResponse } from "util/helpers";
import type { LxdNetworkLease } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchNetworkLeases = async (
  network: string,
  project: string,
): Promise<LxdNetworkLease[]> => {
  return fetch(
    `/1.0/networks/${encodeURIComponent(network)}/leases?project=${project}&recursion=1`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkLease[]>) => {
      return data.metadata;
    });
};
