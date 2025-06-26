import { handleResponse, handleSettledResult } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { IdpGroup } from "types/permissions";
import { withEntitlementsQuery } from "util/entitlements/api";

const idpGroupEntitlements = ["can_delete", "can_edit"];

export const fetchIdpGroups = async (
  isFineGrained: boolean | null,
): Promise<IdpGroup[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    idpGroupEntitlements,
  );
  return fetch(`/1.0/auth/identity-provider-groups?recursion=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<IdpGroup[]>) => {
      return data.metadata;
    });
};

export const createIdpGroup = async (
  group: Partial<IdpGroup>,
): Promise<void> => {
  await fetch(`/1.0/auth/identity-provider-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: group.name, groups: group.groups }),
  }).then(handleResponse);
};

export const updateIdpGroup = async (group: IdpGroup): Promise<void> => {
  await fetch(`/1.0/auth/identity-provider-groups/${group.name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  }).then(handleResponse);
};

export const renameIdpGroup = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  await fetch(`/1.0/auth/identity-provider-groups/${oldName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
    }),
  }).then(handleResponse);
};

export const deleteIdpGroup = async (group: string): Promise<void> => {
  await fetch(`/1.0/auth/identity-provider-groups/${group}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const deleteIdpGroups = async (groups: string[]): Promise<void> => {
  return Promise.allSettled(
    groups.map(async (group) => deleteIdpGroup(group)),
  ).then(handleSettledResult);
};
