import { FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import CloudInitConfig from "components/forms/CloudInitConfig";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";

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
  const codeRenderer = (value?: unknown) =>
    value === "-" || value === undefined ? (
      ""
    ) : (
      <CloudInitConfig config={value as string} />
    );

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
          getConfigurationRow({
            formik,
            label: "Network config",
            name: "cloud_init_network_config",
            defaultValue: "\n\n",
            readOnlyRenderer: codeRenderer,
            children: (
              <CloudInitConfig
                config={formik.values.cloud_init_network_config ?? ""}
                setConfig={(config) =>
                  void formik.setFieldValue("cloud_init_network_config", config)
                }
              />
            ),
          }),

          getConfigurationRow({
            formik,
            label: "User data",
            name: "cloud_init_user_data",
            defaultValue: "\n\n",
            readOnlyRenderer: codeRenderer,
            children: (
              <CloudInitConfig
                config={formik.values.cloud_init_user_data ?? ""}
                setConfig={(config) =>
                  void formik.setFieldValue("cloud_init_user_data", config)
                }
              />
            ),
          }),

          getConfigurationRow({
            formik,
            label: "Vendor data",
            name: "cloud_init_vendor_data",
            defaultValue: "\n\n",
            readOnlyRenderer: codeRenderer,
            children: (
              <CloudInitConfig
                config={formik.values.cloud_init_vendor_data ?? ""}
                setConfig={(config) =>
                  void formik.setFieldValue("cloud_init_vendor_data", config)
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
