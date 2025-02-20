import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdProfile } from "types/profile";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";

const profileEntitlements = ["can_delete", "can_edit"];

export const fetchProfile = (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdProfile> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    profileEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles/${name}?project=${project}&recursion=1${entitlements}`)
      .then(handleEtagResponse)
      .then((data) => resolve(data as LxdProfile))
      .catch(reject);
  });
};

export const fetchProfiles = (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdProfile[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    profileEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/profiles?project=${project}&recursion=1${entitlements}`)
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
