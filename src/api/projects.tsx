import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdProject } from "types/project";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { withEntitlementsQuery } from "util/entitlements/api";

const projectEntitlements = [
  "can_create_images",
  "can_create_image_aliases",
  "can_create_instances",
];

export const fetchProjects = (
  isFineGrained: boolean | null,
): Promise<LxdProject[]> => {
  const entitlements = `&${withEntitlementsQuery(isFineGrained, projectEntitlements)}`;
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProject[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchProject = (
  name: string,
  isFineGrained: boolean | null,
): Promise<LxdProject> => {
  const entitlements = `?${withEntitlementsQuery(isFineGrained, projectEntitlements)}`;
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${name}${entitlements}`)
      .then(handleEtagResponse)
      .then((data) => resolve(data as LxdProject))
      .catch(reject);
  });
};

export const createProject = (body: string): Promise<void> => {
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

export const updateProject = (project: LxdProject): Promise<void> => {
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

export const renameProject = (
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

export const deleteProject = (project: LxdProject): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${project.name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
