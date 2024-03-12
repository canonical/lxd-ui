import { AbortControllerState, checkDuplicateName } from "./helpers";
import * as Yup from "yup";

export const testDuplicateIdpGroupName = (
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, Yup.TestFunction<string | undefined, Yup.AnyObject>] => {
  return [
    "deduplicate",
    "A identity provider group with this name already exists",
    (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          "",
          controllerState,
          "auth/identity-provider-groups",
        )
      );
    },
  ];
};
