import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import ConfigurationTable from "pages/networks/forms/ConfigurationTable";
import { getConfigurationRow } from "pages/networks/forms/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormBridge: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      rows={[
        getConfigurationRow({
          formik: formik,
          name: "bridge_mtu",
          label: "MTU",
          help: "Bridge MTU (default varies if tunnel or fan setup)",
          defaultValue: "",
          children: <Input type="text" />,
        }),

        getConfigurationRow({
          formik: formik,
          name: "bridge_hwaddr",
          label: "Hardware address",
          help: "MAC address for the bridge",
          defaultValue: "",
          children: <Input type="text" />,
        }),

        ...(formik.values.type === "bridge"
          ? [
              getConfigurationRow({
                formik: formik,
                name: "bridge_driver",
                label: "Bridge Driver",
                help: "Bridge driver: native or openvswitch",
                defaultValue: "",
                children: (
                  <Select
                    options={[
                      {
                        label: "Select option",
                        value: "",
                        disabled: true,
                      },
                      {
                        label: "Native",
                        value: "native",
                      },
                      {
                        label: "Openvswitch",
                        value: "openvswitch",
                      },
                    ]}
                  />
                ),
              }),
            ]
          : []),
      ]}
    />
  );
};

export default NetworkFormBridge;
