import { handleResponse } from "util/helpers";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";
import { fetchStoragePools } from "./storage-pools";
import type { BulkOperationItem, BulkOperationResult } from "util/promises";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdOperationResponse } from "types/operation";
import { isBucketCompatibleDriver } from "util/storageOptions";
import { addTarget } from "util/target";
import { getStorageBucketURL } from "util/storageBucket";

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

export const fetchStorageBucket = async (
  pool: string,
  project: string,
  bucketName: string,
  isFineGrained: boolean | null,
  target?: string | null,
): Promise<LxdStorageBucket> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);
  addEntitlements(params, isFineGrained, storageBucketEntitlements);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets/${encodeURIComponent(bucketName)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageBucket>) => {
      return { ...data.metadata, pool } as LxdStorageBucket;
    });
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
): Promise<BulkOperationResult[]> => {
  const results: BulkOperationResult[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      buckets.map(async (bucket) => {
        const item: BulkOperationItem = {
          name: bucket.name,
          type: "bucket",
          href: getStorageBucketURL(bucket.name, bucket.pool, project),
        };
        return deleteStorageBucket(bucket.name, bucket.pool, project)
          .then(() => {
            pushSuccess(results, item);
            continueOrFinish(results, buckets.length, resolve);
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "", item);
            continueOrFinish(results, buckets.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

export const fetchStorageBucketKeys = async (
  bucket: LxdStorageBucket,
  isFineGrained: boolean | null,
  project: string,
): Promise<LxdStorageBucketKey[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, storageBucketEntitlements);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(bucket.pool)}/buckets/${encodeURIComponent(bucket.name)}/keys?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageBucketKey[]>) => {
      return data.metadata;
    });
};

export const fetchStorageBucketKey = async (
  bucket: LxdStorageBucket,
  keyName: string,
  isFineGrained: boolean | null,
  project: string,
): Promise<LxdStorageBucketKey[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addEntitlements(params, isFineGrained, storageBucketEntitlements);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(bucket.pool)}/buckets/${encodeURIComponent(bucket.name)}/keys/${encodeURIComponent(keyName)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdStorageBucketKey[]>) => {
      return data.metadata;
    });
};

export const createStorageBucketKey = async (
  body: string,
  project: string,
  pool: string,
  bucket: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets/${encodeURIComponent(bucket)}/keys?${params.toString()}`,
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

export const updateStorageBucketKey = async (
  bucket: string,
  key: LxdStorageBucketKey,
  pool: string,
  project: string,
  target?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  await fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets/${encodeURIComponent(bucket)}/keys/${encodeURIComponent(key.name)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(key),
    },
  ).then(handleResponse);
};

export const deleteStorageBucketKey = async (
  bucket: string,
  key: string,
  pool: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/storage-pools/${encodeURIComponent(pool)}/buckets/${encodeURIComponent(bucket)}/keys/${encodeURIComponent(key)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const deleteStorageBucketKeyBulk = async (
  bucket: LxdStorageBucket,
  keys: LxdStorageBucketKey[],
  project: string,
): Promise<BulkOperationResult[]> => {
  const results: BulkOperationResult[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      keys.map(async (key) => {
        const item: BulkOperationItem = {
          name: key.name,
          type: "bucket-key",
          href: getStorageBucketURL(bucket.name, bucket.pool, project),
        };
        return deleteStorageBucketKey(
          bucket.name,
          key.name,
          bucket.pool,
          project,
        )
          .then(() => {
            pushSuccess(results, item);
            continueOrFinish(results, keys.length, resolve);
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "", item);
            continueOrFinish(results, keys.length, resolve);
          });
      }),
    ).catch(reject);
  });
};
