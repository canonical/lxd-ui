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
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProject[]>) => {
        resolve(data.metadata);
      })
      .catch(reject);
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
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${name}${entitlements}`)
      .then(handleEtagResponse)
      .then((data) => {
        resolve(data as LxdProject);
      })
      .catch(reject);
  });
};

export const createProject = async (body: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects`, {
      method: "POST",
      body: body,
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateProject = async (project: LxdProject): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${project.name}`, {
      method: "PUT",
      body: JSON.stringify(project),
      headers: {
        "If-Match": project.etag ?? "invalid-etag",
      },
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameProject = async (
  oldName: string,
  newName: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${oldName}`, {
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

export const deleteProject = async (project: LxdProject): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${project.name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
