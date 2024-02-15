import {
  handleEtagResponse,
  handleResponse,
  handleSettledResult,
} from "util/helpers";
import {
  LxdStoragePool,
  LxdStoragePoolResources,
  LxdStorageVolume,
  LxdStorageVolumeState,
  UploadState,
} from "types/storage";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";
import axios, { AxiosResponse } from "axios";
import { LxdClusterMember } from "types/cluster";
import { cephDriver } from "util/storageOptions";

export const fetchStoragePool = (
  pool: string,
  project: string,
  target?: string,
): Promise<LxdStoragePool> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(
      `/1.0/storage-pools/${pool}?project=${project}&recursion=1${targetParam}`,
    )
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePool>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchStoragePools = (
  project: string,
): Promise<LxdStoragePool[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePool[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchStoragePoolResources = (
  pool: string,
): Promise<LxdStoragePoolResources> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/resources`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePoolResources>) =>
        resolve(data.metadata),
      )
      .catch(reject);
  });
};

export const createPool = (
  pool: Partial<LxdStoragePool>,
  project: string,
  target?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(`/1.0/storage-pools?project=${project}${targetParam}`, {
      method: "POST",
      body: JSON.stringify(pool),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

const getClusterPool = (
  pool: Partial<LxdStoragePool>,
): Partial<LxdStoragePool> => {
  const poolForCluster = { ...pool };
  if (pool.driver !== cephDriver) {
    delete poolForCluster.config;
  }

  return poolForCluster;
};

const getMemberPool = (
  pool: Partial<LxdStoragePool>,
): Partial<LxdStoragePool> => {
  const poolForMember = { ...pool };
  // config keys for ceph storage pool cannot be member specific
  if (pool.driver === cephDriver) {
    delete poolForMember.config;
  }

  return poolForMember;
};

export const createClusteredPool = (
  pool: LxdStoragePool,
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<void> => {
  const memberPool = getMemberPool(pool);
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      clusterMembers.map((item) =>
        createPool(memberPool, project, item.server_name),
      ),
    )
      .then(handleSettledResult)
      .then(() => {
        return createPool(getClusterPool(pool), project);
      })
      .then(resolve)
      .catch(reject);
  });
};

export const updatePool = (
  pool: Partial<LxdStoragePool>,
  project: string,
  target?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(`/1.0/storage-pools/${pool.name}?project=${project}${targetParam}`, {
      method: "PATCH",
      body: JSON.stringify(pool),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateClusteredPool = (
  pool: Partial<LxdStoragePool>,
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<void> => {
  const memberPool = getMemberPool(pool);
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      clusterMembers.map(async (item) =>
        updatePool(memberPool, project, item.server_name),
      ),
    )
      .then(handleSettledResult)
      .then(() => updatePool(getClusterPool(pool), project))
      .then(resolve)
      .catch(reject);
  });
};

export const renameStoragePool = (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
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

export const deleteStoragePool = (
  pool: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const fetchStorageVolumes = (
  pool: string,
  project: string,
): Promise<LxdStorageVolume[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/volumes?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolume[]>) =>
        resolve(data.metadata.map((volume) => ({ ...volume, pool }))),
      )
      .catch(reject);
  });
};

export const fetchStorageVolume = (
  pool: string,
  project: string,
  type: string,
  volume: string,
): Promise<LxdStorageVolume> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes/${type}/${volume}?project=${project}&recursion=1`,
    )
      .then(handleEtagResponse)
      .then((data) => resolve({ ...data, pool } as LxdStorageVolume))
      .catch(reject);
  });
};

export const fetchStorageVolumeState = (
  pool: string,
  project: string,
  type: string,
  volume: string,
): Promise<LxdStorageVolumeState> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes/${type}/${volume}/state?project=${project}&recursion=1`,
    )
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolumeState>) =>
        resolve(data.metadata),
      )
      .catch(reject);
  });
};

export const renameStorageVolume = (
  project: string,
  volume: LxdStorageVolume,
  newName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}?project=${project}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: newName,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const createIsoStorageVolume = (
  pool: string,
  isoFile: File,
  name: string,
  project: string,
  setUploadState: (value: UploadState) => void,
  uploadController: AbortController,
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
          signal: uploadController.signal,
        },
      )
      .then((response: AxiosResponse<LxdOperationResponse>) => response.data)
      .then(resolve)
      .catch(reject);
  });
};

export const createStorageVolume = (
  pool: string,
  project: string,
  volume: Partial<LxdStorageVolume>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/volumes?project=${project}`, {
      method: "POST",
      body: JSON.stringify(volume),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateStorageVolume = (
  pool: string,
  project: string,
  volume: Partial<LxdStorageVolume>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes/${volume.type ?? ""}/${
        volume.name ?? ""
      }?project=${project}`,
      {
        method: "PUT",
        body: JSON.stringify(volume),
        headers: {
          "If-Match": volume.etag ?? "invalid-etag",
        },
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteStorageVolume = (
  volume: string,
  pool: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes/custom/${volume}?project=${project}`,
      {
        method: "DELETE",
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
