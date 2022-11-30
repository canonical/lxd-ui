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

export const createProfile = (name: string, description: string) => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/profiles", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};
