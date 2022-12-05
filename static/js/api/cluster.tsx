import { handleResponse } from "../util/helpers";
import { LxdClusterMember } from "../types/cluster";
import { LxdApiResponse } from "../types/apiResponse";

export const fetchClusterMembers = (): Promise<LxdClusterMember[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/cluster/members?recursion=2")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdClusterMember[]>) =>
        resolve(data.metadata)
      )
      .catch(reject);
  });
};
