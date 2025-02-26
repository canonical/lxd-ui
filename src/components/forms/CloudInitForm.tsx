import { FC } from "react";
import { Button, Icon, Tooltip } from "@canonical/react-components";
import CloudInitConfig from "components/forms/CloudInitConfig";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { ensureEditMode } from "util/instanceEdit";
import classnames from "classnames";
import { getConfigRowMetadata } from "util/configInheritance";

export interface CloudInitFormValues {
  cloud_init_network_config?: string;
  cloud_init_user_data?: string;
  cloud_init_vendor_data?: string;
}

export const cloudInitPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceKey("cloud_init_network_config")]:
      values.cloud_init_network_config,
    [getInstanceKey("cloud_init_user_data")]: values.cloud_init_user_data,
    [getInstanceKey("cloud_init_vendor_data")]: values.cloud_init_vendor_data,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const CloudInitForm: FC<Props> = ({ formik }) => {
  const getCloudInitRow = (label: string, name: string, value?: string) => {
    const metadata = getConfigRowMetadata(formik.values, name);
    const isOverridden = value !== undefined;

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
                key={`cloud-init-${name}`}
                config={metadata.value as string}
              />
            </b>
          </div>
          {metadata && (
            <div className="p-text--small u-text--muted">
              From: {metadata.source}
            </div>
          )}
        </div>
      ),
      override: isOverridden ? (
        <>
          <CloudInitConfig
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
            className="u-no-margin--bottom"
          >
            <Icon name="close" className="clear-configuration-icon" />
          </Button>
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
