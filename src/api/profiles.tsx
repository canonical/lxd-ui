import { handleEtagResponse, handleResponse } from "util/helpers";
import { LxdProfile } from "types/profile";
import { LxdApiResponse } from "types/apiResponse";

export const fetchProfile = (
  name: string,
  project: string,
): Promise<LxdProfile> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}?project=${project}&recursion=1`)
      .then(handleEtagResponse)
      .then((data) => resolve(data as LxdProfile))
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

export const createProfile = (body: string, project: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles?project=${project}`, {
      method: "POST",
      body: body,
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateProfile = (
  profile: LxdProfile,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${profile.name}?project=${project}`, {
      method: "PUT",
      body: JSON.stringify(profile),
      headers: {
        "If-Match": profile.etag ?? "invalid-etag",
      },
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameProfile = (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${oldName}?project=${project}`, {
      method: "POST",
      body: JSON.stringify({
        name: newName,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteProfile = (name: string, project: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
