import React, { FC } from "react";
import { Notification } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import CloudInitConfig from "pages/profiles/CloudInitConfig";

export interface CloudInitFormValues {
  ["cloud-init_network-config"]: string;
  ["cloud-init_user-data"]: string;
  ["cloud-init_vendor-data"]: string;
}

export const cloudInitPayload = (values: FormValues) => {
  return {
    ["cloud-init.network-config"]: values["cloud-init_network-config"],
    ["cloud-init.user-data"]: values["cloud-init_user-data"],
    ["cloud-init.vendor-data"]: values["cloud-init_vendor-data"],
  };
};

interface Props {
  formik: FormikProps<FormValues>;
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
        config={formik.values["cloud-init_network-config"]}
        setConfig={(config) =>
          formik.setFieldValue("cloud-init_network-config", config)
        }
      />
      <CloudInitConfig
        title="User data"
        config={formik.values["cloud-init_user-data"]}
        setConfig={(config) =>
          formik.setFieldValue("cloud-init_user-data", config)
        }
      />
      <CloudInitConfig
        title="Vendor data"
        config={formik.values["cloud-init_vendor-data"]}
        setConfig={(config) =>
          formik.setFieldValue("cloud-init_vendor-data", config)
        }
      />
    </>
  );
};

export default CloudInitForm;
