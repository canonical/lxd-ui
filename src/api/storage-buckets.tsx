import { handleResponse } from "util/helpers";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";
import { fetchStoragePools } from "./storage-pools";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdOperationResponse } from "types/operation";
import { isBucketCompatibleDriver } from "util/storageOptions";
import { getTargetParam } from "./storage-volumes";

export const storageBucketEntitlements = ["can_delete", "can_edit"];

export const fetchStorageBucketsFromPool = async (
  pool: string,
  isFineGrained: boolean | null,
  project: string,
): Promise<LxdStorageBucket[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageBucketEntitlements,
  );

  return fetch(
    `/1.0/storage-pools/${pool}/buckets?project=${project}&recursion=1${entitlements}`,
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
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageBucketEntitlements,
  );
  const targetParam = getTargetParam(target);
  return fetch(
    `/1.0/storage-pools/${pool}/buckets/${bucketName}?project=${project}${targetParam}${entitlements}`,
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
  const targetParam = target ? `&target=${target}` : "";

  return fetch(
    `/1.0/storage-pools/${pool}/buckets?project=${project}${targetParam}`,
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
  const targetParam = target ? `&target=${target}` : "";
  await fetch(
    `/1.0/storage-pools/${pool}/buckets/${bucket.name}?project=${project}${targetParam}`,
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
  await fetch(
    `/1.0/storage-pools/${pool}/buckets/${bucket}?project=${project}`,
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

export const fetchStorageBucketKeys = async (
  bucket: LxdStorageBucket,
  isFineGrained: boolean | null,
  project: string,
): Promise<LxdStorageBucketKey[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    storageBucketEntitlements,
  );

  return fetch(
    `/1.0/storage-pools/${bucket.pool}/buckets/${bucket.name}/keys?project=${project}&recursion=1${entitlements}`,
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
  return fetch(
    `/1.0/storage-pools/${pool}/buckets/${bucket}/keys?project=${project}`,
    {
      method: "POST",
      body: body,
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteStorageBucketKey = async (
  bucket: string,
  key: string,
  pool: string,
  project: string,
): Promise<void> => {
  await fetch(
    `/1.0/storage-pools/${pool}/buckets/${bucket}/keys/${key}?project=${project}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};

export const deleteStorageBucketKeyBulk = async (
  bucket: LxdStorageBucket,
  keys: LxdStorageBucketKey[],
  project: string,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      keys.map(async (key) => {
        return deleteStorageBucketKey(
          bucket.name,
          key.name,
          bucket.pool,
          project,
        )
          .then(() => {
            pushSuccess(results);
            continueOrFinish(results, keys.length, resolve);
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, keys.length, resolve);
          });
      }),
    ).catch(reject);
  });
};
