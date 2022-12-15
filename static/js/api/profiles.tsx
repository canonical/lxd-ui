import { handleResponse } from "../util/helpers";
import { LxdProfile } from "../types/profile";
import { LxdApiResponse } from "../types/apiResponse";

export const fetchProfile = (name: string): Promise<LxdProfile> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProfile>) => resolve(data.metadata))
      .catch(reject);
  });
};

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

export const createProfileFromJson = (profileConfiguration: string) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/profiles", {
      method: "POST",
      body: profileConfiguration,
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const updateProfileFromJson = (profileConfiguration: string) => {
  const profile = JSON.parse(profileConfiguration) as LxdProfile;
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profile/${profile.name}`, {
      method: "PATCH",
      body: profileConfiguration,
    })
      .then(handleResponse)
      .then(resolve)
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
