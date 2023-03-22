import React, { FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import CloudInitConfig from "pages/profiles/CloudInitConfig";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getOverrideRow } from "pages/instances/forms/OverrideRow";
import OverrideTable from "pages/instances/forms/OverrideTable";

export interface CloudInitFormValues {
  cloud_init_network_config?: string;
  cloud_init_user_data?: string;
  cloud_init_vendor_data?: string;
}

export const cloudInitPayload = (values: SharedFormTypes) => {
  return {
    ["cloud-init.network-config"]: values.cloud_init_network_config,
    ["cloud-init.user-data"]: values.cloud_init_user_data,
    ["cloud-init.vendor-data"]: values.cloud_init_vendor_data,
  };
};

interface Props {
  formik: SharedFormikTypes;
}

const CloudInitForm: FC<Props> = ({ formik }) => {
  return (
    <OverrideTable
      configurationExtra={
        <>
          {" "}
          <Tooltip message="Applied only to images that have the cloud-init package installed.">
            <Icon name="warning-grey" />
          </Tooltip>
        </>
      }
      rows={[
        getOverrideRow({
          formik: formik,
          label: "Network config",
          name: "cloud_init_network_config",
          defaultValue: "",
          children: (
            <CloudInitConfig
              config={formik.values.cloud_init_network_config ?? ""}
              setConfig={(config) =>
                formik.setFieldValue("cloud_init_network_config", config)
              }
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "User data",
          name: "cloud_init_user_data",
          defaultValue: "",
          children: (
            <CloudInitConfig
              config={formik.values.cloud_init_user_data ?? ""}
              setConfig={(config) =>
                formik.setFieldValue("cloud_init_user_data", config)
              }
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Vendor data",
          name: "cloud_init_vendor_data",
          defaultValue: "",
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
  );
};

export default CloudInitForm;
