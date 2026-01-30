import type { AnyObject, TestContext, TestFunction } from "yup";
import { checkDuplicateName } from "util/helpers";
import type { AbortControllerState } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import type { StorageBucketFormValues } from "pages/storage/forms/StorageBucketForm";
import type { LxdStorageBucket } from "types/storage";

export const testDuplicateStorageBucketName = (
  project: string,
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A bucket with this name already exists",
    async (value?: string, context?: TestContext) => {
      const parent = context?.parent as StorageBucketFormValues;
      const pool = parent.pool;

      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          project,
          controllerState,
          `storage-pools/${encodeURIComponent(pool)}/buckets`,
        )
      );
    },
  ];
};

export const testDuplicateBucketKeyName = (
  project: string,
  bucket: LxdStorageBucket,
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A key with this name already exists",
    async (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          project,
          controllerState,
          `storage-pools/${encodeURIComponent(bucket.pool)}/buckets/${encodeURIComponent(bucket.name)}/keys`,
        )
      );
    },
  ];
};

export const getStorageBucketURL = (
  name: string,
  pool: string,
  project: string,
) => {
  return `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(pool)}/bucket/${encodeURIComponent(name)}`;
};
