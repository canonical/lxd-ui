import { getProfileConfigKeys } from "util/instanceConfigFields";
import {
  profileDetailConfigPayload,
  profileDetailPayload,
} from "pages/profiles/forms/ProfileDetailsForm";
import { formDeviceToPayload } from "util/formDevices";
import { resourceLimitsPayload } from "components/forms/ResourceLimitsForm";
import { securityPoliciesPayload } from "components/forms/SecurityPoliciesForm";
import { snapshotsPayload } from "components/forms/InstanceSnapshotsForm";
import { cloudInitPayload } from "components/forms/CloudInitForm";
import { getUnhandledKeyValues } from "util/formFields";
import type { EditProfileFormValues } from "pages/profiles/EditProfile";
import type { LxdProfile } from "types/profile";
import { migrationPayload } from "components/forms/MigrationForm";
import { bootPayload } from "components/forms/BootForm";
import { sshKeyPayload } from "components/forms/SshKeyForm";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import * as Yup from "yup";

export const getProfilePayload = (
  profile: LxdProfile,
  values: EditProfileFormValues,
) => {
  const handledConfigKeys = getProfileConfigKeys();
  const handledKeys = new Set(["name", "description", "devices", "config"]);

  return {
    ...profileDetailPayload(values),
    devices: formDeviceToPayload(values.devices),
    config: {
      ...profileDetailConfigPayload(values),
      ...resourceLimitsPayload(values),
      ...securityPoliciesPayload(values),
      ...snapshotsPayload(values),
      ...migrationPayload(values),
      ...bootPayload(values),
      ...cloudInitPayload(values),
      ...sshKeyPayload(values),
      ...getUnhandledKeyValues(profile.config, handledConfigKeys),
    },
    ...getUnhandledKeyValues(profile, handledKeys),
  };
};

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
