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

export const storageVolumeEntitlements = ["can_delete", "can_edit"];

export const fetchStorageVolumes = async (
  pool: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageVolumeEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes?project=${project}&recursion=1${entitlements}`,
    )
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolume[]>) => {
        resolve(data.metadata.map((volume) => ({ ...volume, pool })));
      })
      .catch(reject);
  });
};

export const fetchAllStorageVolumes = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageVolumeEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-volumes?recursion=1&project=${project}${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageVolume[]>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchStorageVolume = async (
  pool: string,
  project: string,
  type: string,
  volume: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageVolumeEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes/${type}/${volume}?project=${project}&recursion=1${entitlements}`,
    )
      .then(handleEtagResponse)
      .then((data) => {
        resolve({ ...data, pool } as LxdStorageVolume);
      })
      .catch(reject);
  });
};

export const fetchStorageVolumeState = async (
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
      .then((data: LxdApiResponse<LxdStorageVolumeState>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const renameStorageVolume = async (
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

export const createIsoStorageVolume = async (
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

export const createStorageVolume = async (
  pool: string,
  project: string,
  volume: Partial<LxdStorageVolume>,
  target?: string,
): Promise<void> => {
  const targetParam = target ? `&target=${target}` : "";

  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${pool}/volumes?project=${project}${targetParam}`,
      {
        method: "POST",
        body: JSON.stringify(volume),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateStorageVolume = async (
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

export const deleteStorageVolume = async (
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

export const migrateStorageVolume = async (
  volume: Partial<LxdStorageVolume>,
  targetPool: string,
  targetProject: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/custom/${volume.name}?project=${targetProject}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: volume.name,
          pool: targetPool,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

// Including project and target params if they did not change from source configs breaks the API call.
// Therefore, we only include them if they are different from the source configs, that's why both project and target are optional inputs
export const duplicateStorageVolume = async (
  volume: Partial<LxdStorageVolume>,
  pool: string,
  project?: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    const url = new URL(
      `/1.0/storage-pools/${pool}/volumes/custom`,
      window.location.origin,
    );
    const params = new URLSearchParams();

    if (project) {
      params.append("project", project);
    }

    if (target) {
      params.append("target", target);
    }

    url.search = params.toString();

    fetch(url.toString(), {
      method: "POST",
      body: JSON.stringify(volume),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
