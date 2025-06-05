import { handleResponse } from "util/helpers";
import type { LxdStorageBucket } from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";
import { fetchStoragePools } from "./storage-pools";

export const storageVolumeEntitlements = [
  "can_delete",
  "can_edit",
  "can_create",
];

const bucketCompatibleDrivers = ["cephobject"];
export const isBucketCompatibleDriver = (driver: string): boolean => {
  return bucketCompatibleDrivers.includes(driver);
};

export const fetchStorageBucketsFromPool = async (
  pool: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageBucket[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageVolumeEntitlements,
  );

  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/buckets?recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdStorageBucket[]>) => {
        resolve(data.metadata.map((bucket) => ({ ...bucket, pool })));
      })
      .catch(reject);
  });
};

export const fetchAllStorageBuckets = async (
  isFineGrained: boolean | null,
): Promise<LxdStorageBucket[]> => {
  const pools = await fetchStoragePools(isFineGrained);

  const fetches = pools
    .filter((pool) => {
      return isBucketCompatibleDriver(pool.driver);
    })
    .map(async (pool) => fetchStorageBucketsFromPool(pool.name, isFineGrained));

  const allBuckets = await Promise.all(fetches);
  return allBuckets.flat();
};

export const deleteStorageBucket = async (
  bucket: string,
  pool: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/storage-pools/${pool}/buckets/${bucket}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
