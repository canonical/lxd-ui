import type { FC } from "react";
import { useState } from "react";
import { Button, Icon, Tooltip } from "@canonical/react-components";
import CloudInitConfig from "components/forms/CloudInitConfig";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { ensureEditMode } from "util/instanceEdit";
import classnames from "classnames";
import { getConfigRowMetadata } from "util/configInheritance";
import CloudInitExpandButton from "components/forms/CloudInitExpandButton";
import ProfileRichChip from "pages/profiles/ProfileRichChip";
import { getProfileFromSource } from "util/devices";

export interface CloudInitFormValues {
  cloud_init_network_config?: string;
  cloud_init_user_data?: string;
  cloud_init_vendor_data?: string;
}

export type CloudInitKey = keyof CloudInitFormValues;

export const cloudInitPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("cloud_init_network_config")]:
      values.cloud_init_network_config,
    [getInstanceField("cloud_init_user_data")]: values.cloud_init_user_data,
    [getInstanceField("cloud_init_vendor_data")]: values.cloud_init_vendor_data,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const CloudInitForm: FC<Props> = ({ formik, project }) => {
  const getCloudInitRow = (
    label: string,
    name: CloudInitKey,
    value: string | undefined,
  ) => {
    const [rowVersion, setRowVersion] = useState(0);
    const metadata = getConfigRowMetadata(formik.values, name);
    const isOverridden = value !== undefined;

    const forceUpdate = () => {
      setRowVersion((prev) => prev + 1);
    };

    const metadataSource = metadata?.source || "";
    const isInherited = metadataSource && metadataSource !== formik.values.name;

    const profileName = isInherited
      ? getProfileFromSource(metadataSource)
      : null;

    const source = profileName ? (
      <>
        profile{" "}
        <ProfileRichChip
          profileName={profileName}
          projectName={project}
          className={classnames({
            "u-text--line-through": isOverridden,
          })}
        />
      </>
    ) : (
      metadataSource
    );

    return getConfigurationRowBase({
      configuration: <strong>{label}</strong>,
      inherited: (
        <div
          className={classnames({
            "u-text--muted": isOverridden,
            "u-text--line-through": isOverridden,
          })}
        >
          <div className="mono-font">
            <b>
              <CloudInitConfig
                key={`cloud-init-${name}-${metadata.value}`}
                config={metadata.value as string}
              />
            </b>
          </div>
          {metadata && (
            <div className="u-d-flex u-margin-top--small">
              <span className="p-text--small u-text--muted">From {source}</span>

              {metadata.value && (
                <CloudInitExpandButton
                  formik={formik}
                  project={project}
                  name={name}
                  source={source}
                  initialValue={metadata.value}
                  isReadOnly
                  className="u-no-margin--top u-margin-left--small"
                />
              )}
            </div>
          )}
        </div>
      ),
      override: isOverridden ? (
        <>
          <CloudInitConfig
            key={`cloud-init-override-${name}-${rowVersion}`}
            config={value ?? ""}
            setConfig={(config) => {
              ensureEditMode(formik);
              formik.setFieldValue(name, config);
            }}
          />
          <Button
            onClick={() => {
              ensureEditMode(formik);
              formik.setFieldValue(name, undefined);
            }}
            type="button"
            appearance="base"
            title={formik.values.editRestriction ?? "Clear override"}
            disabled={!!formik.values.editRestriction}
            hasIcon
            className="u-no-margin--bottom u-no-margin--right"
          >
            <Icon name="close" className="clear-configuration-icon" />
          </Button>
          <CloudInitExpandButton
            formik={formik}
            project={project}
            name={name}
            initialValue={value ?? ""}
            onApplyChanges={forceUpdate}
            isReadOnly={!!formik.values.editRestriction}
          />
        </>
      ) : (
        <Button
          onClick={() => {
            ensureEditMode(formik);
            formik.setFieldValue(name, "\n\n");
          }}
          className="u-no-margin--bottom"
          type="button"
          appearance="base"
          title={formik.values.editRestriction ?? "Create override"}
          hasIcon
          disabled={!!formik.values.editRestriction}
        >
          <Icon name="edit" />
        </Button>
      ),
    });
  };

  return (
    <div className="cloud-init">
      <ScrollableConfigurationTable
        configurationExtra={
          <Tooltip
            message="Applied only to images that have the cloud-init package installed."
            className="configuration-extra"
          >
            <Icon name="warning-grey" />
          </Tooltip>
        }
        rows={[
          getCloudInitRow(
            "Network config",
            "cloud_init_network_config",
            formik.values.cloud_init_network_config,
          ),
          getCloudInitRow(
            "User data",
            "cloud_init_user_data",
            formik.values.cloud_init_user_data,
          ),
          getCloudInitRow(
            "Vendor data",
            "cloud_init_vendor_data",
            formik.values.cloud_init_vendor_data,
          ),
        ]}
      />
    </div>
  );
};

export default CloudInitForm;
