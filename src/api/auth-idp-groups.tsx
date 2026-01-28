import { handleResponse, handleSettledResult } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { IdpGroup } from "types/permissions";
import { addEntitlements } from "util/entitlements/api";
import { ROOT_PATH } from "util/rootPath";

const idpGroupEntitlements = ["can_delete", "can_edit"];

export const fetchIdpGroups = async (
  isFineGrained: boolean | null,
): Promise<IdpGroup[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, idpGroupEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/auth/identity-provider-groups?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<IdpGroup[]>) => {
      return data.metadata;
    });
};

export const createIdpGroup = async (
  group: Partial<IdpGroup>,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/auth/identity-provider-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: group.name, groups: group.groups }),
  }).then(handleResponse);
};

export const updateIdpGroup = async (group: IdpGroup): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/auth/identity-provider-groups/${encodeURIComponent(group.name)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(group),
    },
  ).then(handleResponse);
};

export const renameIdpGroup = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/auth/identity-provider-groups/${encodeURIComponent(oldName)}`,
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

export const deleteIdpGroup = async (group: string): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/auth/identity-provider-groups/${encodeURIComponent(group)}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const deleteIdpGroups = async (groups: string[]): Promise<void> => {
  return Promise.allSettled(
    groups.map(async (group) => deleteIdpGroup(group)),
  ).then(handleSettledResult);
};
