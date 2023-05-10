import { AbortControllerState, checkDuplicateName } from "util/helpers";
import { TestFunction } from "yup";
import { AnyObject } from "yup/lib/types";

export const testDuplicateName = (
  project: string,
  controllerState: AbortControllerState
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A storage pool with this name already exists",
    (value?: string) => {
      return checkDuplicateName(
        value,
        project,
        controllerState,
        `storage-pools`
      );
    },
  ];
};
