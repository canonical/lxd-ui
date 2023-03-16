import { handleResponse } from "util/helpers";
import { LxdProject } from "types/project";
import { LxdApiResponse } from "types/apiResponse";

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
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProject>) => resolve(data.metadata))
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

export const updateProject = (body: string) => {
  const project = JSON.parse(body) as LxdProject;
  return new Promise((resolve, reject) => {
    fetch(`/1.0/projects/${project.name}`, {
      method: "PUT",
      body: body,
    })
      .then(handleResponse)
      .then((data) => resolve(data))
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
