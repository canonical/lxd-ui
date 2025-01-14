import { handleResponse, handleSettledResult } from "util/helpers";
import { LxdApiResponse } from "types/apiResponse";
import { IdpGroup } from "types/permissions";

export const fetchIdpGroups = (): Promise<IdpGroup[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<IdpGroup[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createIdpGroup = (group: Partial<IdpGroup>): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups`, {
      method: "POST",
      body: JSON.stringify({ name: group.name }),
    })
      .then(() =>
        fetch(`/1.0/auth/identity-provider-groups/${group.name}`, {
          method: "PUT",
          body: JSON.stringify(group),
        }),
      )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateIdpGroup = (group: IdpGroup): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${group.name}`, {
      method: "PUT",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameIdpGroup = (
  oldName: string,
  newName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${oldName}`, {
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

export const deleteIdpGroup = (group: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/auth/identity-provider-groups/${group}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteIdpGroups = (groups: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(groups.map((group) => deleteIdpGroup(group)))
      .then(handleSettledResult)
      .then(resolve)
      .catch(reject);
  });
};
