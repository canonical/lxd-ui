import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdProfile } from "types/profile";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";

const profileEntitlements = ["can_delete", "can_edit"];

export const fetchProfile = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdProfile> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    profileEntitlements,
  );
  return fetch(
    `/1.0/profiles/${name}?project=${project}&recursion=1${entitlements}`,
  )
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdProfile;
    });
};

export const fetchProfiles = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdProfile[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    profileEntitlements,
  );
  return fetch(`/1.0/profiles?project=${project}&recursion=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdProfile[]>) => {
      return data.metadata;
    });
};

export const createProfile = async (
  body: string,
  project: string,
): Promise<void> => {
  await fetch(`/1.0/profiles?project=${project}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const updateProfile = async (
  profile: LxdProfile,
  project: string,
): Promise<void> => {
  await fetch(`/1.0/profiles/${profile.name}?project=${project}`, {
    method: "PUT",
    body: JSON.stringify(profile),
    headers: {
      "Content-Type": "application/json",
      "If-Match": profile.etag ?? "invalid-etag",
    },
  }).then(handleResponse);
};

export const renameProfile = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  await fetch(`/1.0/profiles/${oldName}?project=${project}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
    }),
  }).then(handleResponse);
};

export const deleteProfile = async (
  name: string,
  project: string,
): Promise<void> => {
  await fetch(`/1.0/profiles/${name}?project=${project}`, {
    method: "DELETE",
  }).then(handleResponse);
};
