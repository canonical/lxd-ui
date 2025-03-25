import { getProfileConfigKeys } from "util/instanceConfigFields";
import { profileDetailPayload } from "pages/profiles/forms/ProfileDetailsForm";
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
