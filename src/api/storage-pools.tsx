import {
  constructMemberError,
  handleEtagResponse,
  handleResponse,
  handleSettledResult,
} from "util/helpers";
import type {
  LxdStoragePool,
  LXDStoragePoolOnClusterMember,
  LxdStoragePoolResources,
  LxdStorageVolume,
  LxdStorageVolumeState,
  UploadState,
} from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import type { AxiosResponse } from "axios";
import axios from "axios";
import type { LxdClusterMember } from "types/cluster";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { withEntitlementsQuery } from "util/entitlements/api";

export const storagePoolEntitlements = ["can_edit", "can_delete"];
export const storageVolumeEntitlements = ["can_delete"];

export const fetchStoragePool = async (
  pool: string,
  isFineGrained: boolean | null,
  target?: string,
): Promise<LxdStoragePool> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storagePoolEntitlements,
  );
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(`/1.0/storage-pools/${pool}?recursion=1${targetParam}${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePool>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchStoragePools = async (
  isFineGrained: boolean | null,
): Promise<LxdStoragePool[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storagePoolEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePool[]>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchStoragePoolResources = async (
  pool: string,
  target?: string,
): Promise<LxdStoragePoolResources> => {
  const targetParam = target ? `?target=${target}` : "";
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/resources${targetParam}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStoragePoolResources>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchClusteredStoragePoolResources = async (
  pool: string,
  clusterMembers: LxdClusterMember[],
): Promise<LxdStoragePoolResources[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        return fetchStoragePoolResources(pool, member.server_name);
      }),
    )
      .then((results) => {
        const poolsOnMembers: LxdStoragePoolResources[] = [];
        for (let i = 0; i < clusterMembers.length; i++) {
          const memberName = clusterMembers[i].server_name;
          const result = results[i];
          if (result.status === "rejected") {
            reject(constructMemberError(result, memberName));
          }
          if (result.status === "fulfilled") {
            const promise = results[
              i
            ] as PromiseFulfilledResult<LxdStoragePoolResources>;
            poolsOnMembers.push({ ...promise.value, memberName: memberName });
          }
        }
        resolve(poolsOnMembers);
      })
      .catch(reject);
  });
};

export const createPool = async (
  pool: Partial<LxdStoragePool>,
  target?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `?target=${target}` : "";
    fetch(`/1.0/storage-pools${targetParam}`, {
      method: "POST",
      body: JSON.stringify(pool),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

const getClusterAndMemberPoolPayload = (pool: Partial<LxdStoragePool>) => {
  const memberSpecificConfigKeys = new Set([
    "source",
    "size",
    "zfs.pool_name",
    "lvm.thinpool_name",
    "lvm.vg_name",
  ]);
  const configKeys = Object.keys(pool.config || {});
  const memberConfig: LxdStoragePool["config"] = {};
  const clusterConfig: LxdStoragePool["config"] = {};
  for (const key of configKeys) {
    if (memberSpecificConfigKeys.has(key)) {
      memberConfig[key] = pool.config?.[key];
    } else {
      clusterConfig[key] = pool.config?.[key];
    }
  }

  const clusterPoolPayload = { ...pool, config: clusterConfig };
  const memberPoolPayload = { ...pool, config: memberConfig };

  return {
    clusterPoolPayload,
    memberPoolPayload,
  };
};

export const createClusteredPool = async (
  pool: LxdStoragePool,
  clusterMembers: LxdClusterMember[],
  sourcePerClusterMember?: ClusterSpecificValues,
  zfsPoolNamePerClusterMember?: ClusterSpecificValues,
  sizePerClusterMember?: ClusterSpecificValues,
): Promise<void> => {
  const { memberPoolPayload, clusterPoolPayload } =
    getClusterAndMemberPoolPayload(pool);
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (item) => {
        const clusteredMemberPool = {
          ...memberPoolPayload,
          config: {
            ...memberPoolPayload.config,
            source: sourcePerClusterMember?.[item.server_name],
            size: sizePerClusterMember?.[item.server_name],
            "zfs.pool_name": zfsPoolNamePerClusterMember?.[item.server_name],
          },
        };
        return createPool(clusteredMemberPool, item.server_name);
      }),
    )
      .then(handleSettledResult)
      .then(async () => {
        return createPool(clusterPoolPayload);
      })
      .then(resolve)
      .catch(reject);
  });
};

export const updatePool = async (
  pool: Partial<LxdStoragePool>,
  target?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `?target=${target}` : "";
    fetch(`/1.0/storage-pools/${pool.name}${targetParam}`, {
      method: "PATCH",
      body: JSON.stringify(pool),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateClusteredPool = async (
  pool: Partial<LxdStoragePool>,
  clusterMembers: LxdClusterMember[],
  sizePerClusterMember?: ClusterSpecificValues,
): Promise<void> => {
  const { memberPoolPayload, clusterPoolPayload } =
    getClusterAndMemberPoolPayload(pool);
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (item) => {
        const clusteredMemberPool = {
          ...memberPoolPayload,
          config: {
            ...memberPoolPayload.config,
            size: sizePerClusterMember?.[item.server_name],
          },
        };
        return updatePool(clusteredMemberPool, item.server_name);
      }),
    )
      .then(handleSettledResult)
      .then(async () => updatePool(clusterPoolPayload))
      .then(resolve)
      .catch(reject);
  });
};

export const renameStoragePool = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${oldName}`, {
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

export const deleteStoragePool = async (pool: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const fetchPoolFromClusterMembers = async (
  poolName: string,
  clusterMembers: LxdClusterMember[],
  isFineGrained: boolean | null,
): Promise<LXDStoragePoolOnClusterMember[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        return fetchStoragePool(poolName, isFineGrained, member.server_name);
      }),
    )
      .then((results) => {
        const poolOnMembers: LXDStoragePoolOnClusterMember[] = [];
        for (let i = 0; i < clusterMembers.length; i++) {
          const memberName = clusterMembers[i].server_name;
          const result = results[i];
          if (result.status === "rejected") {
            reject(constructMemberError(result, memberName));
          }
          if (result.status === "fulfilled") {
            const promise = results[
              i
            ] as PromiseFulfilledResult<LxdStoragePool>;
            poolOnMembers.push({ ...promise.value, memberName: memberName });
          }
        }
        resolve(poolOnMembers);
      })
      .catch(reject);
  });
};

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
