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
import { withEntitlementsQuery } from "util/entitlements/api";

export const volumeEntitlements = [
  "can_delete",
  "can_edit",
  "can_manage_snapshots",
];

export const fetchStorageVolumes = async (
  pool: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume[]> => {
  const entitlements = withEntitlementsQuery(isFineGrained, volumeEntitlements);
  return fetch(
    `/1.0/storage-pools/${pool}/volumes?project=${project}&recursion=1${entitlements}`,
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
  const entitlements = withEntitlementsQuery(isFineGrained, volumeEntitlements);
  return fetch(
    `/1.0/storage-volumes?recursion=1&project=${project}${entitlements}`,
  )
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
  const entitlements = withEntitlementsQuery(isFineGrained, volumeEntitlements);
  const targetParam = getTargetParam(target);
  return fetch(
    `/1.0/storage-pools/${pool}/volumes/${type}/${volume}?project=${project}${targetParam}&recursion=1${entitlements}`,
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
  const targetParam = getTargetParam(target);
  return fetch(
    `/1.0/storage-pools/${pool}/volumes/${type}/${volume}/state?project=${project}${targetParam}&recursion=1`,
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
): Promise<void> => {
  const targetParam = getTargetParam(target);
  await fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}?project=${project}${targetParam}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    },
  ).then(handleResponse);
};

export const createIsoStorageVolume = async (
  pool: string,
  isoFile: File,
  name: string,
  project: string,
  setUploadState: (value: UploadState) => void,
  uploadController: AbortController,
): Promise<LxdOperationResponse> => {
  return axios
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
    .then((response: AxiosResponse<LxdOperationResponse>) => response.data);
};

export const createStorageVolume = async (
  pool: string,
  project: string,
  volume: Partial<LxdStorageVolume>,
  target?: string,
): Promise<void> => {
  const targetParam = target ? `&target=${target}` : "";
  await fetch(
    `/1.0/storage-pools/${pool}/volumes?project=${project}${targetParam}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(volume),
    },
  ).then(handleResponse);
};

export const updateStorageVolume = async (
  pool: string,
  project: string,
  volume: LxdStorageVolume,
  target?: string,
): Promise<void> => {
  const targetParam = getTargetParam(target);
  await fetch(
    `/1.0/storage-pools/${pool}/volumes/${volume.type}/${volume.name}?project=${project}${targetParam}`,
    {
      method: "PUT",
      body: JSON.stringify(volume),
      headers: {
        "Content-Type": "application/json",
        "If-Match": volume.etag ?? "invalid-etag",
      },
    },
  ).then(handleResponse);
};

export const deleteStorageVolume = async (
  volume: string,
  pool: string,
  project: string,
  target?: string,
): Promise<void> => {
  const targetParam = getTargetParam(target);
  await fetch(
    `/1.0/storage-pools/${pool}/volumes/custom/${volume}?project=${project}${targetParam}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const migrateStorageVolume = async (
  volume: Partial<LxdStorageVolume>,
  targetPool: string,
  targetProject: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(target);
  return fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/custom/${volume.name}?project=${targetProject}${targetParam}`,
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
  if (target) {
    params.append("target", target);
  }
  const queryString = params.toString();
  return fetch(`/1.0/storage-pools/${pool}/volumes/custom?${queryString}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(volume),
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const getTargetParam = (target?: string | null) => {
  return target && target !== "none" ? `&target=${target}` : "";
};
