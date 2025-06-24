import type { LxdStoragePool } from "types/storage";
import type { LxdSettings } from "types/server";

// Some storage pool drivers have their volumes assigned a location on one dedicated cluster member.
// Other pool drivers like ceph are cluster wide, so they are not member local in that sense.
// Identify if the pool at hand is in the first category.
export const hasMemberLocalVolumes = (
  poolName: string,
  pools: LxdStoragePool[],
  settings?: LxdSettings,
) => {
  const pool = pools.find((pool) => pool.name === poolName);
  const driverDetails = settings?.environment?.storage_supported_drivers.find(
    (driver) => driver.Name === pool?.driver,
  );
  if (!driverDetails) {
    return false;
  }
  return !driverDetails.Remote;
};
