import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ConfigurationTable from "components/ConfigurationTable";
import { BRIDGE } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useIsClustered } from "context/useIsClustered";
import ClusteredBridgeInterfaceInput from "pages/networks/forms/ClusteredBridgeInterfaceInput";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormBridge: FC<Props> = ({ formik, filterRows }) => {
  const isClustered = useIsClustered();

  const rows = filterRows([
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
            label: "Driver",
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
          getConfigurationRow({
            formik,
            name: "bridge_external_interfaces",
            label: "External interfaces",
            defaultValue: "",
            hideOverrideBtn:
              isClustered && formik.values.bridge_external_interfaces === "set",
            children: isClustered ? (
              <ClusteredBridgeInterfaceInput
                formik={formik}
                placeholder="Enter interface name"
              />
            ) : (
              <Input type="text" />
            ),
            readOnlyRenderer: (value) =>
              isClustered && value !== "-" && value !== undefined ? (
                <ClusteredBridgeInterfaceInput
                  key={JSON.stringify(
                    formik.values.bridge_external_interfaces_per_member ?? {},
                  )}
                  formik={formik}
                  placeholder="Enter interface name"
                />
              ) : (
                <>{value}</>
              ),
          }),
        ]
      : []),
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="p-heading--4" id={slugify(BRIDGE)}>
        Bridge
      </h2>
      <ConfigurationTable rows={rows} />
    </>
  );
};

export default NetworkFormBridge;
