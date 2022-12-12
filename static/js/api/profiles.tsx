import { handleResponse } from "../util/helpers";
import { LxdProfile } from "../types/profile";
import { LxdApiResponse } from "../types/apiResponse";

export const fetchProfiles = (): Promise<LxdProfile[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/profiles?recursion=1")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProfile[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createProfile = (profile: LxdProfile) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/profiles", {
      method: "POST",
      body: JSON.stringify(profile),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const deleteProfile = (name: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};
