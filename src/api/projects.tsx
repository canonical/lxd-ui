import { handleEtagResponse, handleResponse } from "util/helpers";
import { LxdProject } from "types/project";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";

export const fetchProjects = (): Promise<LxdProject[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects?recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProject[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchProject = (name: string): Promise<LxdProject> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${name}`)
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
