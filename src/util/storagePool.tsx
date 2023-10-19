import { AbortControllerState, checkDuplicateName } from "util/helpers";
import { AnyObject, TestFunction } from "yup";

export const testDuplicateStoragePoolName = (
  project: string,
  controllerState: AbortControllerState,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A storage pool with this name already exists",
    (value?: string) => {
      return checkDuplicateName(
        value,
        project,
        controllerState,
        `storage-pools`,
      );
    },
  ];
};
