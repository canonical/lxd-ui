import React, { FC } from "react";
import { Notification, Textarea } from "@canonical/react-components";
import CloudInitConfig from "pages/profiles/CloudInitConfig";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import OverrideField from "pages/instances/forms/OverrideField";

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
    <>
      <Notification
        severity="caution"
        title="Before you add cloud init configurations"
      >
        Applied only to the images that already have the cloud-init package
        installed.
      </Notification>
      <OverrideField
        formik={formik}
        label="Network config"
        name="cloud_init_network_config"
        defaultValue=""
        overrideElement={Textarea}
      >
        <CloudInitConfig
          title="Network config"
          config={formik.values.cloud_init_network_config ?? ""}
          setConfig={(config) =>
            formik.setFieldValue("cloud_init_network_config", config)
          }
        />
      </OverrideField>
      <OverrideField
        formik={formik}
        label="User data"
        name="cloud_init_user_data"
        defaultValue=""
        overrideElement={Textarea}
      >
        <CloudInitConfig
          title="User data"
          config={formik.values.cloud_init_user_data ?? ""}
          setConfig={(config) =>
            formik.setFieldValue("cloud_init_user_data", config)
          }
        />
      </OverrideField>
      <OverrideField
        formik={formik}
        label="Vendor data"
        name="cloud_init_vendor_data"
        defaultValue=""
        overrideElement={Textarea}
      >
        <CloudInitConfig
          title="Vendor data"
          config={formik.values.cloud_init_vendor_data ?? ""}
          setConfig={(config) =>
            formik.setFieldValue("cloud_init_vendor_data", config)
          }
        />
      </OverrideField>
    </>
  );
};

export default CloudInitForm;
