import { handleResponse } from "util/helpers";
import {
  LxdStoragePool,
  LxdStoragePoolResources,
  LxdStorageVolume,
  UploadState,
} from "types/storage";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";
import { TIMEOUT_300, watchOperation } from "api/operations";
import axios, { AxiosResponse } from "axios";

export const fetchStoragePool = (
  pool: string,
  project: string
): Promise<LxdStoragePool> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}?project=${project}&recursion=1`)
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
  pool: string
): Promise<LxdStoragePoolResources> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/resources`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePoolResources>) =>
        resolve(data.metadata)
      )
      .catch(reject);
  });
};

export const createStoragePool = (pool: LxdStoragePool, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools?project=${project}`, {
      method: "POST",
      body: JSON.stringify(pool),
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

export const deleteStoragePool = (pool: string, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const fetchStorageVolumes = (
  pool: string
): Promise<LxdStorageVolume[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/volumes?all-projects=true&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolume[]>) =>
        resolve(data.metadata)
      )
      .catch(reject);
  });
};

export const createStorageVolume = (
  volume: string,
  pool: string,
  project: string
): Promise<LxdStorageVolume> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/volumes?project=${project}`, {
      method: "POST",
      body: JSON.stringify({
        content_type: "filesystem",
        name: volume,
        type: "custom",
      }),
    })
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolume>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createIsoStorageVolume = (
  pool: string,
  isoFile: File,
  name: string,
  project: string,
  setUploadState: (value: UploadState) => void
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/1.0/storage-pools/${pool}/volumes/custom?project=${project}`,
        isoFile,
        {
          headers: {
            "Content-Type": "application/octet-stream",
            "X-LXD-name": name,
            "X-LXD-type": "iso",
          },
          onUploadProgress: (event) => {
            setUploadState({
              percentage: event.progress ? Math.floor(event.progress * 100) : 0,
              loaded: event.loaded,
              total: event.total,
            });
          },
        }
      )
      .then((response: AxiosResponse<LxdOperationResponse>) => response.data)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation, TIMEOUT_300).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteStorageVolume = (
  volume: string,
  pool: string,
  project: string
): Promise<LxdStorageVolume> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes/custom/${volume}?project=${project}`,
      {
        method: "DELETE",
      }
    )
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolume>) => resolve(data.metadata))
      .catch(reject);
  });
};
