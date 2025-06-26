import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdProject } from "types/project";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { withEntitlementsQuery } from "util/entitlements/api";

const projectEntitlements = [
  "can_create_image_aliases",
  "can_create_images",
  "can_create_instances",
  "can_create_networks",
  "can_create_network_acls",
  "can_create_profiles",
  "can_create_storage_volumes",
  "can_delete",
  "can_edit",
  "can_view_events",
  "can_view_operations",
];

export const fetchProjects = async (
  isFineGrained: boolean | null,
): Promise<LxdProject[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    projectEntitlements,
  );
  return fetch(`/1.0/projects?recursion=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdProject[]>) => {
      return data.metadata;
    });
};

export const fetchProject = async (
  name: string,
  isFineGrained: boolean | null,
): Promise<LxdProject> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    projectEntitlements,
    "?",
  );
  return fetch(`/1.0/projects/${name}${entitlements}`)
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdProject;
    });
};

export const createProject = async (body: string): Promise<void> => {
  await fetch(`/1.0/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const updateProject = async (project: LxdProject): Promise<void> => {
  await fetch(`/1.0/projects/${project.name}`, {
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
  return fetch(`/1.0/projects/${oldName}`, {
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

export const deleteProject = async (project: LxdProject): Promise<void> => {
  await fetch(`/1.0/projects/${project.name}`, {
    method: "DELETE",
  }).then(handleResponse);
};
