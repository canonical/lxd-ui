import { handleResponse } from "util/helpers";
import type { LxdReplicator } from "types/replicator";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { addEntitlements } from "util/entitlements/api";
import { ROOT_PATH } from "util/rootPath";

const replicatorEntitlements = ["can_edit", "can_delete"];

export const fetchReplicators = async (
  project: string | null,
  isFineGrained: boolean | null,
): Promise<LxdReplicator[]> => {
  const params = new URLSearchParams();
  if (project) {
    params.set("project", project);
  } else {
    params.set("all-projects", "true");
  }
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, replicatorEntitlements);
  return fetch(`${ROOT_PATH}/1.0/replicators?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdReplicator[]>) => {
      return data.metadata;
    });
};

export const fetchReplicator = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdReplicator> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  params.set("project", project);
  addEntitlements(params, isFineGrained, replicatorEntitlements);
  return fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdReplicator>) => {
      return data.metadata;
    });
};

export const renameReplicator = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/replicators/${encodeURIComponent(oldName)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  }).then(handleResponse);
};

export const deleteReplicator = async (
  name: string,
  project: string,
): Promise<void> => {
  await fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}?project=${encodeURIComponent(project)}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const runReplicator = async (
  name: string,
  project: string,
  action: "restore" | "start",
): Promise<LxdOperationResponse> => {
  return fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}/state?project=${encodeURIComponent(project)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};
