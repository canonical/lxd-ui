import type { FormikProps } from "formik";
import type { ReplicatorFormValues } from "types/forms/replicator";
import type { LxdReplicator } from "types/replicator";
import type { LxdInstance } from "types/instance";
import type { LxdStoragePool } from "types/storage";
import { isDiskDevice } from "util/devices";
import { getCustomVolumeDevices } from "util/instanceSnapshots";
import { isRemoteStorage } from "util/storageOptions";
import { cephReplicatorConfigPrefix } from "util/storagePoolForm";

export const getPayload = (
  formik: FormikProps<ReplicatorFormValues>,
): Partial<LxdReplicator> => {
  return {
    name: formik.values.name,
    description: formik.values.description,
    config: {
      cluster: formik.values.cluster,
      schedule: formik.values.schedule,
    },
  };
};

// Pools holding the root disks and the custom volumes attached to only one
// instance. Shared volumes and ISO volumes are not replicated.
const getMirroredPoolNames = (
  instances: LxdInstance[],
  pools: LxdStoragePool[],
): string[] => {
  const poolNames: string[] = [];
  const volumes: { pool: string; volume: string }[] = [];

  instances.forEach((instance) => {
    const devices = instance.expanded_devices ?? {};
    Object.values(devices).forEach((device) => {
      if (
        isDiskDevice(device) &&
        device.pool &&
        device.path === "/" &&
        !device.source
      ) {
        poolNames.push(device.pool);
      }
    });
    getCustomVolumeDevices(instance).forEach((name) => {
      const device = devices[name];
      if (isDiskDevice(device) && device.pool && device.source) {
        // Volumes on local pools are scoped to a cluster member.
        const driver = pools.find((pool) => pool.name === device.pool)?.driver;
        const location =
          driver && isRemoteStorage(driver) ? "" : `@${instance.location}`;
        volumes.push({
          pool: device.pool,
          volume: `${device.pool}/${device.source}${location}`,
        });
      }
    });
  });

  const useCount = new Map<string, number>();
  volumes.forEach(({ volume }) => {
    useCount.set(volume, (useCount.get(volume) ?? 0) + 1);
  });
  volumes.forEach(({ pool, volume }) => {
    if (useCount.get(volume) === 1) {
      poolNames.push(pool);
    }
  });

  return [...new Set(poolNames)];
};

// Returns undefined when a needed pool is not visible to the user.
export const isCephMirrored = (
  pools: LxdStoragePool[],
  instances: LxdInstance[],
  project: string,
): boolean | undefined => {
  const key = `${cephReplicatorConfigPrefix}${project}`;
  const hasKey = (pool: LxdStoragePool) => Boolean(pool.config?.[key]?.trim());
  const poolNames = getMirroredPoolNames(instances, pools);

  if (poolNames.length === 0) {
    return pools.some(hasKey);
  }

  const usedPools = poolNames.map((name) =>
    pools.find((pool) => pool.name === name),
  );
  if (usedPools.some((pool) => !pool)) {
    return undefined;
  }

  return usedPools.every((pool) => !!pool && hasKey(pool));
};
