import { handleResponse, handleSettledResult } from "util/helpers";
import { LxdApiResponse } from "types/apiResponse";
import { LxdGroup } from "types/permissions";

export const fetchGroups = (): Promise<LxdGroup[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdGroup[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchGroup = (name: string): Promise<LxdGroup> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/groups/${name}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdGroup>) => resolve(data.metadata))
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
    void Promise.allSettled(groups.map((group) => deleteGroup(group)))
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
