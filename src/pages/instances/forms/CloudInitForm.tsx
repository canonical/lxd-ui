import React, { FC } from "react";
import { Notification } from "@canonical/react-components";
import CloudInitConfig from "pages/profiles/CloudInitConfig";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";

export interface CloudInitFormValues {
  ["cloud-init_network-config"]?: string;
  ["cloud-init_user-data"]?: string;
  ["cloud-init_vendor-data"]?: string;
}

export const cloudInitPayload = (values: SharedFormTypes) => {
  return {
    ["cloud-init.network-config"]: values["cloud-init_network-config"],
    ["cloud-init.user-data"]: values["cloud-init_user-data"],
    ["cloud-init.vendor-data"]: values["cloud-init_vendor-data"],
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
      <CloudInitConfig
        title="Network config"
        config={formik.values["cloud-init_network-config"] ?? ""}
        setConfig={(config) =>
          formik.setFieldValue("cloud-init_network-config", config)
        }
      />
      <CloudInitConfig
        title="User data"
        config={formik.values["cloud-init_user-data"] ?? ""}
        setConfig={(config) =>
          formik.setFieldValue("cloud-init_user-data", config)
        }
      />
      <CloudInitConfig
        title="Vendor data"
        config={formik.values["cloud-init_vendor-data"] ?? ""}
        setConfig={(config) =>
          formik.setFieldValue("cloud-init_vendor-data", config)
        }
      />
    </>
  );
};

export default CloudInitForm;
