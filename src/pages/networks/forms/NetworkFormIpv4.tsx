import type { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { optionTrueFalse } from "util/instanceOptions";
import ConfigurationTable from "components/ConfigurationTable";
import { IPV4 } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormIpv4: FC<Props> = ({ formik, filterRows }) => {
  const hasDhcp = formik.values.ipv4_dhcp !== "false";

  const rows = filterRows([
    ...(formik.values.networkType !== "physical"
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_nat",
            label: "IPv4 NAT",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
            disabled: formik.values.ipv4_address === "none",
            disabledReason: "IPv4 address is set to none",
          }),
        ]
      : []),

    ...(formik.values.networkType !== "physical"
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_dhcp",
            label: "IPv4 DHCP",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),

    ...(formik.values.networkType !== "ovn" &&
    formik.values.networkType !== "physical"
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_dhcp_expiry",
            label: "IPv4 DHCP expiry",
            defaultValue: "",
            disabled: !hasDhcp,
            disabledReason: "IPv4 DHCP is disabled",
            children: <Input type="text" />,
          }),

          getConfigurationRow({
            formik,
            name: "ipv4_dhcp_ranges",
            label: "IPv4 DHCP ranges",
            defaultValue: "",
            disabled: !hasDhcp,
            disabledReason: "IPv4 DHCP is disabled",
            children: <Textarea />,
          }),
        ]
      : []),

    ...(formik.values.networkType === "ovn"
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_l3only",
            label: "IPv4 L3 only",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),

    ...(formik.values.networkType !== "ovn"
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_ovn_ranges",
            label: "IPv4 OVN ranges",
            defaultValue: "",
            children: <Textarea />,
          }),
        ]
      : []),

    ...(["bridge", "physical"].includes(formik.values.networkType)
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_routes",
            label: "IPv4 routes",
            defaultValue: "",
            children: <Textarea />,
          }),
        ]
      : []),

    ...(formik.values.networkType === "physical"
      ? [
          getConfigurationRow({
            formik,
            name: "ipv4_gateway",
            label: "IPv4 gateway",
            defaultValue: "",
            children: <Textarea />,
          }),
          getConfigurationRow({
            formik,
            name: "ipv4_routes_anycast",
            label: "IPv4 routes anycast",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="p-heading--4" id={slugify(IPV4)}>
        IPv4
      </h2>
      <ConfigurationTable rows={rows} />
    </>
  );
};

export default NetworkFormIpv4;
