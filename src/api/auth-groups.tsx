import { handleResponse, handleSettledResult } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdGroup } from "types/permissions";
import { withEntitlementsQuery } from "util/entitlements/api";

export const groupEntitlements = ["can_delete", "can_edit"];

export const fetchGroups = (
  isFineGrained: boolean | null,
): Promise<LxdGroup[]> => {
  const entitlements = withEntitlementsQuery(isFineGrained, groupEntitlements);
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdGroup[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createGroup = (group: Partial<LxdGroup>): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups`, {
      method: "POST",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteGroup = (group: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${group}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteGroups = (groups: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(groups.map((group) => deleteGroup(group)))
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};

export const updateGroup = (group: Partial<LxdGroup>): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${group.name}`, {
      method: "PUT",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameGroup = (
  oldName: string,
  newName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${oldName}`, {
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
