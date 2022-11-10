import { handleResponse } from "../util/helpers";
import { LxdProject } from "../types/project";

export const fetchProjectList = (): Promise<LxdProject[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/projects?recursion=2")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
