import { handleEtagResponse, handleResponse } from "util/helpers";
import { LxdProject } from "types/project";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";
import { TIMEOUT_60, watchOperation } from "api/operations";

export const fetchProjects = (recursion: number): Promise<LxdProject[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects?recursion=${recursion}`)
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

export const createProject = (body: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects`, {
      method: "POST",
      body: body,
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const updateProject = (project: LxdProject) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${project.name}`, {
      method: "PUT",
      body: JSON.stringify(project),
      headers: {
        "If-Match": project.etag ?? "invalid-etag",
      },
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const renameProject = (oldName: string, newName: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${oldName}`, {
      method: "POST",
      body: JSON.stringify({
        name: newName,
      }),
    })
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation, TIMEOUT_60).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteProject = (project: LxdProject) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${project.name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};
