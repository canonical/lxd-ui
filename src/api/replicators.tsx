import { handleResponse } from "util/helpers";
import type { LxdReplicator, LxdReplicatorState } from "types/replicator";
import type { LxdApiResponse } from "types/apiResponse";
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

export const fetchReplicatorState = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdReplicatorState> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addEntitlements(params, isFineGrained, replicatorEntitlements);
  return fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}/state?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdReplicatorState>) => {
      return data.metadata;
    });
};
