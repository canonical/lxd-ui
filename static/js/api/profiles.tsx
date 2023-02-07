import { handleResponse } from "util/helpers";
import { LxdProfile } from "types/profile";
import { LxdApiResponse } from "types/apiResponse";

export const fetchProfile = (
  name: string,
  project: string
): Promise<LxdProfile> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProfile>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchProfiles = (project: string): Promise<LxdProfile[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProfile[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createProfile = (profile: LxdProfile, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles?project=${project}`, {
      method: "POST",
      body: JSON.stringify(profile),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const createProfileFromJson = (body: string, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles?project=${project}`, {
      method: "POST",
      body: body,
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const updateProfileFromJson = (body: string, project: string) => {
  const profile = JSON.parse(body) as LxdProfile;
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${profile.name}?project=${project}`, {
      method: "PUT",
      body: body,
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteProfile = (name: string, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};
