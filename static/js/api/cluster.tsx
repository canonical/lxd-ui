import { handleResponse } from "../helpers";
import { LxdClusterMember } from "../types/cluster";

export const fetchClusterMembers = (): Promise<LxdClusterMember[]> => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/cluster/members?recursion=2")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
