import { handleResponse, handleEtagResponse } from "util/helpers";
import type {
  LxdStorageVolume,
  LxdStorageVolumeState,
  UploadState,
} from "types/storage";
import type { LxdOperationResponse } from "types/operation";
import type { AxiosResponse } from "axios";
import axios from "axios";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";
import { addTarget } from "util/target";
import type { BulkOperationItem, BulkOperationResult } from "util/promises";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import { linkForVolumeDetail } from "util/storageVolume";

export const volumeEntitlements = [
  "can_delete",
  "can_edit",
  "can_manage_snapshots",
  "can_manage_backups",
];

export const fetchStorageVolumes = async (
  pool: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  params.set("project", project);
  addEntitlements(params, isFineGrained, volumeEntitlements);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageVolume[]>) => {
      return data.metadata.map((volume) => ({ ...volume, pool }));
    });
};

export const fetchAllStorageVolumes = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  params.set("project", project);
  addEntitlements(params, isFineGrained, volumeEntitlements);

  return fetch(`/1.0/storage-volumes?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageVolume[]>) => {
      return data.metadata;
    });
};

export const fetchStorageVolume = async (
  pool: string,
  project: string,
  type: string,
  volume: string,
  target: string | null,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  params.set("project", project);
  addTarget(params, target);
  addEntitlements(params, isFineGrained, volumeEntitlements);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/${encodeURIComponent(type)}/${encodeURIComponent(volume)}?${params.toString()}`,
  )
    .then(handleEtagResponse)
    .then((data) => {
      return { ...data, pool } as LxdStorageVolume;
    });
};

export const fetchStorageVolumeState = async (
  pool: string,
  project: string,
  type: string,
  volume: string,
  target?: string,
): Promise<LxdStorageVolumeState> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/${encodeURIComponent(type)}/${encodeURIComponent(volume)}/state?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageVolumeState>) => {
      return data.metadata;
    });
};

export const renameStorageVolume = async (
  project: string,
  volume: LxdStorageVolume,
  newName: string,
  target: string | null = null,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const createIsoStorageVolume = async (
  pool: string,
  isoFile: File,
  name: string,
  project: string,
  setUploadState: (value: UploadState) => void,
  uploadController: AbortController,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return axios
    .post(
      `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/custom?${params.toString()}`,
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
    .then((response: AxiosResponse<LxdOperationResponse>) => response.data);
};

export const createStorageVolume = async (
  pool: string,
  project: string,
  volume: Partial<LxdStorageVolume>,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(volume),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const updateStorageVolume = async (
  pool: string,
  project: string,
  volume: LxdStorageVolume,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}?${params.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify(volume),
      headers: {
        "Content-Type": "application/json",
        "If-Match": volume.etag ?? "invalid-etag",
      },
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteStorageVolume = async (
  volume: string,
  pool: string,
  project: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/custom/${encodeURIComponent(volume)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteStorageVolumeBulk = async (
  volumes: LxdStorageVolume[],
  project: string,
): Promise<BulkOperationResult[]> => {
  const results: BulkOperationResult[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      volumes.map(async (volume) => {
        const item: BulkOperationItem = {
          name: volume.name,
          type: "volume",
          href: linkForVolumeDetail(volume),
        };
        return deleteStorageVolume(
          volume.name,
          volume.pool,
          project,
          volume.location,
        )
          .then(() => {
            pushSuccess(results, item);
            continueOrFinish(results, volumes.length, resolve);
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "", item);
            continueOrFinish(results, volumes.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

export const migrateStorageVolume = async (
  volume: LxdStorageVolume,
  targetPool: string,
  targetProject: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", targetProject);
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/custom/${encodeURIComponent(volume.name)}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: volume.name,
        pool: targetPool,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

// Including project and target params if they did not change from source configs breaks the API call.
// Therefore, we only include them if they are different from the source configs, that's why both project and target are optional inputs
export const copyStorageVolume = async (
  volume: Partial<LxdStorageVolume>,
  pool: string,
  project?: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  if (project) {
    params.append("project", project);
  }
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/custom?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(volume),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const createVolumeBackup = async (
  volume: LxdStorageVolume,
  payload: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", volume.project);
  addTarget(params, volume.location);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}/backups?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const uploadVolume = async (
  file: File | null,
  name: string,
  project: string,
  pool: string,
  setUploadState: (value: UploadState) => void,
  uploadController: AbortController,
  target: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return axios
    .post(
      `/1.0/storage-pools/${encodeURIComponent(pool)}/volumes/custom?${params.toString()}`,
      file,
      {
        headers: {
          "Content-Type": "application/octet-stream",
          "X-LXD-name": name,
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
    .then((response: AxiosResponse<LxdOperationResponse>) => response.data);
};
