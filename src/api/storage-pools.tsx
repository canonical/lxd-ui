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
} from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdClusterMember } from "types/cluster";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { addEntitlements } from "util/entitlements/api";
import { addTarget } from "util/target";
import { ROOT_PATH } from "util/rootPath";

export const storagePoolEntitlements = ["can_edit", "can_delete"];

export const fetchStoragePool = async (
  pool: string,
  isFineGrained: boolean | null,
  target?: string,
): Promise<LxdStoragePool> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addTarget(params, target);
  addEntitlements(params, isFineGrained, storagePoolEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/storage-pools/${encodeURIComponent(pool)}?${params.toString()}`,
  )
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdStoragePool;
    });
};

export const fetchStoragePools = async (
  isFineGrained: boolean | null,
): Promise<LxdStoragePool[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, storagePoolEntitlements);

  return fetch(`${ROOT_PATH}/1.0/storage-pools?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStoragePool[]>) => {
      return data.metadata;
    });
};

export const fetchStoragePoolResources = async (
  pool: string,
  target?: string,
): Promise<LxdStoragePoolResources> => {
  const params = new URLSearchParams();
  addTarget(params, target);

  return fetch(
    `${ROOT_PATH}/1.0/storage-pools/${encodeURIComponent(pool)}/resources?${params.toString()}`,
  )
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
  const params = new URLSearchParams();
  addTarget(params, target);

  await fetch(`${ROOT_PATH}/1.0/storage-pools?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pool),
  }).then(handleResponse);
};

const getClusterAndMemberPoolPayload = (pool: LxdStoragePool) => {
  const memberSpecificConfigKeys = new Set([
    "source",
    "size",
    "zfs.pool_name",
    "lvm.thinpool_name",
    "lvm.vg_name",
    "volatile.initial_source",
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
  pool: LxdStoragePool,
  target?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  addTarget(params, target);

  await fetch(
    `${ROOT_PATH}/1.0/storage-pools/${encodeURIComponent(pool.name)}?${params.toString()}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pool),
    },
  ).then(handleResponse);
};

export const updateClusteredPool = async (
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
        },
      };
      if (sizePerClusterMember?.[item.server_name]) {
        clusteredMemberPool.config.size =
          sizePerClusterMember[item.server_name];
      }
      if (sourcePerClusterMember?.[item.server_name]) {
        clusteredMemberPool.config.source =
          sourcePerClusterMember[item.server_name];
      }
      if (zfsPoolNamePerClusterMember?.[item.server_name]) {
        clusteredMemberPool.config["zfs.pool_name"] =
          zfsPoolNamePerClusterMember[item.server_name];
      }
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
  await fetch(`${ROOT_PATH}/1.0/storage-pools/${encodeURIComponent(oldName)}`, {
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
  await fetch(`${ROOT_PATH}/1.0/storage-pools/${encodeURIComponent(pool)}`, {
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
