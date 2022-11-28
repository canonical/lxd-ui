import { handleResponse } from "../util/helpers";
import { LxdProfile } from "../types/profile";

export const fetchProfiles = (): Promise<LxdProfile[]> => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/profiles?recursion=1")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
