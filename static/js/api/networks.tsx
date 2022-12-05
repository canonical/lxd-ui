import { handleResponse } from "../util/helpers";
import { LxdNetwork } from "../types/network";
import { LxdApiResponse } from "../types/apiResponse";

export const fetchNetworks = (): Promise<LxdNetwork[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/networks?recursion=1")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetwork[]>) => resolve(data.metadata))
      .catch(reject);
  });
};
