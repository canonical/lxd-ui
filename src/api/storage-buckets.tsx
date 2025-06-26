import { handleResponse } from "util/helpers";
import type { LxdStorageBucket } from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";
import { fetchStoragePools } from "./storage-pools";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdOperationResponse } from "types/operation";
import { isBucketCompatibleDriver } from "util/storageOptions";
import { addTarget } from "util/target";

export const storageBucketEntitlements = ["can_delete", "can_edit"];

export const fetchStorageBucketsFromPool = async (
  pool: string,
  isFineGrained: boolean | null,
  project: string,
): Promise<LxdStorageBucket[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, storageBucketEntitlements);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageBucket[]>) => {
      return data.metadata.map((bucket) => ({ ...bucket, pool }));
    });
};

export const fetchAllStorageBuckets = async (
  isFineGrained: boolean | null,
  project: string,
): Promise<LxdStorageBucket[]> => {
  const pools = await fetchStoragePools(isFineGrained);

  const fetches = pools
    .filter((pool) => {
      return isBucketCompatibleDriver(pool.driver);
    })
    .map(async (pool) =>
      fetchStorageBucketsFromPool(pool.name, isFineGrained, project),
    );

  const allBuckets = await Promise.all(fetches);
  return allBuckets.flat();
};

export const createStorageBucket = async (
  body: string,
  project: string,
  pool: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const updateStorageBucket = async (
  bucket: LxdStorageBucket,
  pool: string,
  project: string,
  target?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  await fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets/${encodeURIComponent(bucket.name)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bucket),
    },
  ).then(handleResponse);
};

export const deleteStorageBucket = async (
  bucket: string,
  pool: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets/${encodeURIComponent(bucket)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const deleteStorageBucketBulk = async (
  buckets: LxdStorageBucket[],
  project: string,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      buckets.map(async (bucket) => {
        return deleteStorageBucket(bucket.name, bucket.pool, project)
          .then(() => {
            pushSuccess(results);
            continueOrFinish(results, buckets.length, resolve);
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, buckets.length, resolve);
          });
      }),
    ).catch(reject);
  });
};
