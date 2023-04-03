import React, { FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import CloudInitConfig from "pages/profiles/CloudInitConfig";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";

export interface CloudInitFormValues {
  cloud_init_network_config?: string;
  cloud_init_user_data?: string;
  cloud_init_vendor_data?: string;
}

export const cloudInitPayload = (values: SharedFormTypes) => {
  return {
    [getInstanceKey("cloud_init_network_config")]:
      values.cloud_init_network_config,
    [getInstanceKey("cloud_init_user_data")]: values.cloud_init_user_data,
    [getInstanceKey("cloud_init_vendor_data")]: values.cloud_init_vendor_data,
  };
};

interface Props {
  formik: SharedFormikTypes;
}

const CloudInitForm: FC<Props> = ({ formik }) => {
  const codeRenderer = (value?: unknown) =>
    value === "-" ? value : <CloudInitConfig config={value as string} />;

  return (
    <div className="cloud-init">
      <ConfigurationTable
        formik={formik}
        isCollapsedOverride={true}
        configurationExtra={
          <Tooltip
            message="Applied only to images that have the cloud-init package installed."
            className="configuration-extra"
          >
            <Icon name="warning-grey" />
          </Tooltip>
        }
        rows={[
          getConfigurationRow({
            formik: formik,
            label: "Network config",
            name: "cloud_init_network_config",
            defaultValue: "\n\n",
            readOnlyRenderer: codeRenderer,
            children: (
              <CloudInitConfig
                config={formik.values.cloud_init_network_config ?? ""}
                setConfig={(config) =>
                  formik.setFieldValue("cloud_init_network_config", config)
                }
              />
            ),
          }),

          getConfigurationRow({
            formik: formik,
            label: "User data",
            name: "cloud_init_user_data",
            defaultValue: "\n\n",
            readOnlyRenderer: codeRenderer,
            children: (
              <CloudInitConfig
                config={formik.values.cloud_init_user_data ?? ""}
                setConfig={(config) =>
                  formik.setFieldValue("cloud_init_user_data", config)
                }
              />
            ),
          }),

          getConfigurationRow({
            formik: formik,
            label: "Vendor data",
            name: "cloud_init_vendor_data",
            defaultValue: "\n\n",
            readOnlyRenderer: codeRenderer,
            children: (
              <CloudInitConfig
                config={formik.values.cloud_init_vendor_data ?? ""}
                setConfig={(config) =>
                  formik.setFieldValue("cloud_init_vendor_data", config)
                }
              />
            ),
          }),
        ]}
      />
    </div>
  );
};

export default CloudInitForm;
