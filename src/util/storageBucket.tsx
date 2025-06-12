import type { AnyObject, TestContext, TestFunction } from "yup";
import { checkDuplicateName } from "./helpers";
import type { AbortControllerState } from "./helpers";
import type { StorageBucketFormValues } from "pages/storage/forms/StorageBucketForm";

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
          `storage-pools/${pool}/buckets`,
        )
      );
    },
  ];
};
