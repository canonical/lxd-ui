import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ConfigurationTable from "components/ConfigurationTable";
import { BRIDGE } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormBridge: FC<Props> = ({ formik, filterRows }) => {
  return (
    <>
      <h2 className="p-heading--4" id={slugify(BRIDGE)}>
        Bridge
      </h2>
      <ConfigurationTable
        rows={filterRows([
          getConfigurationRow({
            formik,
            name: "bridge_mtu",
            label: "MTU",
            defaultValue: "",
            children: <Input type="text" />,
          }),

          getConfigurationRow({
            formik,
            name: "bridge_hwaddr",
            label: "Hardware address",
            defaultValue: "",
            children: <Input type="text" />,
          }),

          ...(formik.values.networkType === "bridge"
            ? [
                getConfigurationRow({
                  formik,
                  name: "bridge_driver",
                  label: "Bridge driver",
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
        ])}
      />
    </>
  );
};

export default NetworkFormBridge;
