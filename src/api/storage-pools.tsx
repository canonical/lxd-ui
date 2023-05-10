import { handleResponse } from "util/helpers";
import { LxdStoragePool, LxdStoragePoolResources } from "types/storage";
import { LxdApiResponse } from "types/apiResponse";

export const fetchStoragePool = (
  storage: string,
  project: string
): Promise<LxdStoragePool> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${storage}?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePool>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchStoragePools = (
  project: string
): Promise<LxdStoragePool[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePool[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchStoragePoolResources = (
  storage: string
): Promise<LxdStoragePoolResources> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${storage}/resources`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePoolResources>) =>
        resolve(data.metadata)
      )
      .catch(reject);
  });
};

export const createStoragePool = (storage: LxdStoragePool, project: string) => {
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

export const renameStoragePool = (
  oldName: string,
  newName: string,
  project: string
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${oldName}?project=${project}`, {
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
