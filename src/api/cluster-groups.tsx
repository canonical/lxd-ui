import { handleResponse } from "util/helpers";
import type { LxdClusterGroup } from "types/cluster";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchClusterGroups = async (): Promise<LxdClusterGroup[]> => {
  return fetch("/1.0/cluster/groups?recursion=1")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterGroup[]>) => {
      return data.metadata;
    });
};

export const fetchClusterGroup = async (
  group: string,
): Promise<LxdClusterGroup> => {
  return fetch(`/1.0/cluster/groups/${encodeURIComponent(group)}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterGroup>) => {
      return data.metadata;
    });
};

export const updateClusterGroup = async (
  group: LxdClusterGroup,
): Promise<void> => {
  await fetch(`/1.0/cluster/groups/${encodeURIComponent(group.name)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  }).then(handleResponse);
};

export const createClusterGroup = async (
  group: LxdClusterGroup,
): Promise<void> => {
  await fetch(`/1.0/cluster/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  }).then(handleResponse);
};

export const deleteClusterGroup = async (group: string): Promise<void> => {
  await fetch(`/1.0/cluster/groups/${encodeURIComponent(group)}`, {
    method: "DELETE",
  }).then(handleResponse);
};
