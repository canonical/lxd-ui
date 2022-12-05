import { handleResponse } from "../util/helpers";
import { LxdProject } from "../types/project";
import { LxdApiResponse } from "../types/apiResponse";

export const fetchProjects = (): Promise<LxdProject[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/projects?recursion=2")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdProject[]>) => resolve(data.metadata))
      .catch(reject);
  });
};
