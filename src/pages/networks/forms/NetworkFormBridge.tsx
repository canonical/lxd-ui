import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormBridge: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "bridge_mtu",
          label: "MTU",
          help: "Bridge MTU (default varies if tunnel or fan setup)",
          defaultValue: "",
          children: <Input type="text" />,
        }),

        getConfigurationRow({
          formik,
          name: "bridge_hwaddr",
          label: "Hardware address",
          help: "MAC address for the bridge",
          defaultValue: "",
          children: <Input type="text" />,
        }),

        ...(formik.values.networkType === "bridge"
          ? [
              getConfigurationRow({
                formik,
                name: "bridge_driver",
                label: "Bridge driver",
                help: "Native or openvswitch",
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
