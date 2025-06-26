import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdProfile } from "types/profile";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";

const profileEntitlements = ["can_delete", "can_edit"];

export const fetchProfile = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdProfile> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, profileEntitlements);

  return fetch(`/1.0/profiles/${encodeURIComponent(name)}?${params.toString()}`)
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdProfile;
    });
};

export const fetchProfiles = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdProfile[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  params.set("project", project);
  addEntitlements(params, isFineGrained, profileEntitlements);

  return fetch(`/1.0/profiles?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdProfile[]>) => {
      return data.metadata;
    });
};

export const createProfile = async (
  body: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(`/1.0/profiles?${params.toString()}`, {
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
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/profiles/${encodeURIComponent(profile.name)}?${params.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify(profile),
      headers: {
        "Content-Type": "application/json",
        "If-Match": profile.etag ?? "invalid-etag",
      },
    },
  ).then(handleResponse);
};

export const renameProfile = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/profiles/${encodeURIComponent(oldName)}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    },
  ).then(handleResponse);
};

export const deleteProfile = async (
  name: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/profiles/${encodeURIComponent(name)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};
