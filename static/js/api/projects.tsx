import { handleResponse } from "../helpers";

export type LxdProject = {
  name: string;
  config: {
    "features.images": boolean;
    "features.networks": boolean;
    "features.profiles": boolean;
    "features.storage.volumes": boolean;
  };
  description: string;
  used_by?: string[];
};

export const fetchProjectList = (): Promise<LxdProject[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/projects?recursion=2")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
