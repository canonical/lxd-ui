import { handleResponse } from "util/helpers";
import { LxdNetwork } from "types/network";
import { LxdApiResponse } from "types/apiResponse";

export const fetchNetworks = (project: string): Promise<LxdNetwork[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetwork[]>) => resolve(data.metadata))
      .catch(reject);
  });
};
