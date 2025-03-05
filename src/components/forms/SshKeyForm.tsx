import type { FC } from "react";
import { Button, Icon, Input, Notification } from "@canonical/react-components";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { ensureEditMode, parseSshKeys } from "util/instanceEdit";
import { getAppliedProfiles } from "util/configInheritance";
import { useProfiles } from "context/useProfiles";
import Loader from "components/Loader";
import type { LxdProfile } from "types/profile";

export interface SshKey {
  id: string;
  name: string;
  user: string;
  fingerprint: string;
}

export interface SshKeyFormValues {
  cloud_init_ssh_keys: SshKey[];
}

export const sshKeyPayload = (values: InstanceAndProfileFormValues) => {
  const result: Record<string, string | undefined> = {};

  values.cloud_init_ssh_keys?.forEach((record) => {
    result[`cloud-init.ssh-keys.${record.name}`] =
      `${record.user}:${record.fingerprint}`;
  });

  return result;
};

interface InheritedSshKey {
  sshKey: SshKey;
  source: string;
}

export const getInheritedSshKeys = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedSshKey[] => {
  const inheritedKeys: InheritedSshKey[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      const profileKeys = parseSshKeys(profile);
      profileKeys.forEach((sshKey) =>
        inheritedKeys.push({ sshKey, source: profile.name }),
      );
    }
  }
  return inheritedKeys;
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const SshKeyForm: FC<Props> = ({ formik, project }) => {
  const { data: profiles = [], isLoading: isProfileLoading } =
    useProfiles(project);

  if (isProfileLoading) {
    return <Loader />;
  }

  const inheritedSshKeys = getInheritedSshKeys(formik.values, profiles);

  const getWarningMessage = () => {
    if (formik.values.entityType === "profile") {
      return "Changes get applied on instance creation or restart.";
    }
    if (formik.values.entityType === "instance" && !formik.values.isCreating) {
      return "Changes get applied on instance restart.";
    }
    return undefined;
  };

  const warningMessage = getWarningMessage();

  return (
    <div className="ssh-key-form">
      {warningMessage && (
        <Notification severity="information">{warningMessage}</Notification>
      )}
      {inheritedSshKeys.length > 0 && (
        <h2 className="p-heading--4">Inherited SSH Keys</h2>
      )}
      {inheritedSshKeys.map((record) => (
        <div key={record.sshKey.name}>
          <div className="ssh-key">
            <Input
              label="Name"
              type="text"
              value={record.sshKey.name}
              className="name"
              disabled
              readOnly
            />
            <Input
              label="User"
              type="text"
              value={record.sshKey.user}
              className="user"
              disabled
              readOnly
            />
            <Input
              label="Fingerprint"
              type="text"
              value={record.sshKey.fingerprint}
              wrapperClassName="fingerprint"
              disabled
              readOnly
            />
          </div>
          <p className="p-text--small u-text--muted">
            From: {record.source} profile
          </p>
        </div>
      ))}
      {formik.values.cloud_init_ssh_keys.length > 0 && (
        <h2 className="p-heading--4">Custom SSH Keys</h2>
      )}
      {formik.values.cloud_init_ssh_keys?.map((record) => (
        <div key={record.id} className="ssh-key">
          <Input
            label="Name"
            type="text"
            value={record.name}
            className="name"
            onChange={(e) => {
              ensureEditMode(formik);
              formik.setFieldValue(
                "cloud_init_ssh_keys",
                formik.values.cloud_init_ssh_keys.map((key) => {
                  if (key.id !== record.id) {
                    return key;
                  }
                  return {
                    ...key,
                    name: e.target.value,
                  };
                }),
              );
            }}
          />
          <Input
            label="User"
            type="text"
            value={record.user}
            className="user"
            onChange={(e) => {
              ensureEditMode(formik);
              formik.setFieldValue(
                "cloud_init_ssh_keys",
                formik.values.cloud_init_ssh_keys.map((key) => {
                  if (key.id !== record.id) {
                    return key;
                  }
                  return {
                    ...key,
                    user: e.target.value,
                  };
                }),
              );
            }}
          />
          <Input
            label="Fingerprint"
            type="text"
            value={record.fingerprint}
            wrapperClassName="fingerprint"
            onChange={(e) => {
              ensureEditMode(formik);
              formik.setFieldValue(
                "cloud_init_ssh_keys",
                formik.values.cloud_init_ssh_keys.map((key) => {
                  if (key.id !== record.id) {
                    return key;
                  }
                  return {
                    ...key,
                    fingerprint: e.target.value,
                  };
                }),
              );
            }}
          />
          <div>
            <Button
              onClick={() => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "cloud_init_ssh_keys",
                  formik.values.cloud_init_ssh_keys.filter(
                    (key) => key.name !== record.name,
                  ),
                );
              }}
              type="button"
              title="Remove key"
              hasIcon
            >
              <Icon name="delete" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => {
          ensureEditMode(formik);
          formik.setFieldValue("cloud_init_ssh_keys", [
            ...formik.values.cloud_init_ssh_keys,
            {
              id: `ssh-key-${formik.values.cloud_init_ssh_keys.length + 1}`,
              name: `ssh-key-${formik.values.cloud_init_ssh_keys.length + 1}`,
              user: "root",
              fingerprint: "",
            },
          ]);
        }}
        hasIcon
      >
        <Icon name="plus" />
        <span>Attach SSH key</span>
      </Button>
    </div>
  );
};

export default SshKeyForm;
