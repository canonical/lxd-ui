import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdProject } from "types/project";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { addEntitlements } from "util/entitlements/api";
import { ROOT_PATH } from "util/rootPath";

const projectEntitlements = [
  "can_create_image_aliases",
  "can_create_images",
  "can_create_instances",
  "can_create_networks",
  "can_create_network_acls",
  "can_create_profiles",
  "can_create_storage_volumes",
  "can_create_storage_buckets",
  "can_delete",
  "can_edit",
];

export const fetchProjects = async (
  isFineGrained: boolean | null,
): Promise<LxdProject[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, projectEntitlements);

  return fetch(`${ROOT_PATH}/1.0/projects?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdProject[]>) => {
      return data.metadata;
    });
};

export const fetchProject = async (
  name: string,
  isFineGrained: boolean | null,
): Promise<LxdProject> => {
  const params = new URLSearchParams();
  addEntitlements(params, isFineGrained, projectEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/projects/${encodeURIComponent(name)}?${params.toString()}`,
  )
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdProject;
    });
};

export const createProject = async (body: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const updateProject = async (project: LxdProject): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/projects/${encodeURIComponent(project.name)}`, {
    method: "PUT",
    body: JSON.stringify(project),
    headers: {
      "Content-Type": "application/json",
      "If-Match": project.etag ?? "invalid-etag",
    },
  }).then(handleResponse);
};

export const renameProject = async (
  oldName: string,
  newName: string,
): Promise<LxdOperationResponse> => {
  return fetch(`${ROOT_PATH}/1.0/projects/${encodeURIComponent(oldName)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
    }),
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteProject = async (
  project: LxdProject,
  force?: boolean,
): Promise<void> => {
  const params = new URLSearchParams();
  if (force) {
    params.set("force", "1");
  }
  const url = `${ROOT_PATH}/1.0/projects/${encodeURIComponent(project.name)}?${params.toString()}`;

  await fetch(url, {
    method: "DELETE",
  }).then(handleResponse);
};
