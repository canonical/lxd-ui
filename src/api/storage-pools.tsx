import {
  constructMemberError,
  handleResponse,
  handleSettledResult,
} from "util/helpers";
import type {
  LxdStoragePool,
  LXDStoragePoolOnClusterMember,
  LxdStoragePoolResources,
} from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdClusterMember } from "types/cluster";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { withEntitlementsQuery } from "util/entitlements/api";

export const storagePoolEntitlements = ["can_edit", "can_delete"];

export const fetchStoragePool = async (
  pool: string,
  isFineGrained: boolean | null,
  target?: string,
): Promise<LxdStoragePool> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storagePoolEntitlements,
  );
  const targetParam = target ? `&target=${target}` : "";
  return fetch(
    `/1.0/storage-pools/${pool}?recursion=1${targetParam}${entitlements}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStoragePool>) => {
      return data.metadata;
    });
};

export const fetchStoragePools = async (
  isFineGrained: boolean | null,
): Promise<LxdStoragePool[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storagePoolEntitlements,
  );
  return fetch(`/1.0/storage-pools?recursion=1${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStoragePool[]>) => {
      return data.metadata;
    });
};

export const fetchStoragePoolResources = async (
  pool: string,
  target?: string,
): Promise<LxdStoragePoolResources> => {
  const targetParam = target ? `?target=${target}` : "";
  return fetch(`/1.0/storage-pools/${pool}/resources${targetParam}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStoragePoolResources>) => {
      return data.metadata;
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
  const targetParam = target ? `?target=${target}` : "";
  await fetch(`/1.0/storage-pools${targetParam}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pool),
  }).then(handleResponse);
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
  return Promise.allSettled(
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
    });
};

export const updatePool = async (
  pool: Partial<LxdStoragePool>,
  target?: string,
): Promise<void> => {
  const targetParam = target ? `?target=${target}` : "";
  await fetch(`/1.0/storage-pools/${pool.name}${targetParam}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pool),
  }).then(handleResponse);
};

export const updateClusteredPool = async (
  pool: Partial<LxdStoragePool>,
  clusterMembers: LxdClusterMember[],
  sizePerClusterMember?: ClusterSpecificValues,
): Promise<void> => {
  const { memberPoolPayload, clusterPoolPayload } =
    getClusterAndMemberPoolPayload(pool);
  return Promise.allSettled(
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
    .then(async () => updatePool(clusterPoolPayload));
};

export const renameStoragePool = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  await fetch(`/1.0/storage-pools/${oldName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
    }),
  }).then(handleResponse);
};

export const deleteStoragePool = async (pool: string): Promise<void> => {
  await fetch(`/1.0/storage-pools/${pool}`, {
    method: "DELETE",
  }).then(handleResponse);
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
