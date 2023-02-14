import { handleResponse } from "util/helpers";
import { LxdStorage } from "types/storage";
import { LxdApiResponse } from "types/apiResponse";

export const fetchStorages = (project: string): Promise<LxdStorage[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorage[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createStoragePool = (storage: LxdStorage, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools?project=${project}`, {
      method: "POST",
      body: JSON.stringify(storage),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const deleteStoragePool = (name: string, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${name}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};
