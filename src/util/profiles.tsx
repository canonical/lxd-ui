import type { LxdProfile } from "types/profile";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import * as Yup from "yup";
import type {
  CreateInstanceFormValues,
  EditInstanceFormValues,
} from "types/forms/instanceAndProfile";

export const profileNameValidation = (
  project: string,
  controllerState: AbortControllerState,
  oldName?: string,
): Yup.StringSchema =>
  Yup.string()
    .test(
      "deduplicate",
      "A profile with this name already exists",
      async (value, context) => {
        const targetProject =
          (context.parent as { targetProject?: string }).targetProject ??
          project;

        return (
          oldName === value ||
          checkDuplicateName(value, targetProject, controllerState, "profiles")
        );
      },
    )
    .test(
      "size",
      "Profile name must be between 1 and 63 characters",
      (value) => !value || value.length < 64,
    )
    .matches(/^[A-Za-z0-9- ]+$/, {
      message: "Only alphanumeric, space and hyphen characters are allowed",
    })
    .matches(/^[A-Za-z].*$/, {
      message: "Profile name must start with a letter",
    });

export const hasCloudInit = (profile: LxdProfile): boolean => {
  const cloudInitKeys = [
    "cloud-init.user-data",
    "cloud-init.vendor-data",
    "cloud-init.network-config",
  ];

  return cloudInitKeys.some((key) => Boolean(profile.config[key]));
};

export const getAppliedProfiles = (
  values: CreateInstanceFormValues | EditInstanceFormValues,
  profiles: LxdProfile[],
): LxdProfile[] => {
  return profiles
    .filter((profile) => values.profiles.includes(profile.name))
    .sort(
      (a, b) =>
        values.profiles.indexOf(b.name) - values.profiles.indexOf(a.name),
    );
};
