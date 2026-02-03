import {
  ensureStableSorting,
  handleResponse,
  handleSettledResult,
} from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdAuthGroup } from "types/permissions";
import { addEntitlements } from "util/entitlements/api";
import { ROOT_PATH } from "util/rootPath";

export const groupEntitlements = ["can_delete", "can_edit"];

export const fetchGroups = async (
  isFineGrained: boolean | null,
): Promise<LxdAuthGroup[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, groupEntitlements);

  return fetch(`${ROOT_PATH}/1.0/auth/groups?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdAuthGroup[]>) => {
      data.metadata.map(ensureStableSorting);
      return data.metadata;
    });
};

export const createGroup = async (
  group: Partial<LxdAuthGroup>,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/auth/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  }).then(handleResponse);
};

export const deleteGroup = async (group: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/auth/groups/${encodeURIComponent(group)}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const deleteGroups = async (groups: string[]): Promise<void> => {
  return Promise.allSettled(
    groups.map(async (group) => deleteGroup(group)),
  ).then(handleSettledResult);
};

export const updateGroup = async (group: LxdAuthGroup): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/auth/groups/${encodeURIComponent(group.name)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(group),
    },
  ).then(handleResponse);
};

export const renameGroup = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/auth/groups/${encodeURIComponent(oldName)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
    }),
  }).then(handleResponse);
};
