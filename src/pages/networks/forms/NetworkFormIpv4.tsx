import { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormIpv4: FC<Props> = ({ formik }) => {
  const hasDhcp = formik.values.ipv4_dhcp !== "false";

  return (
    <ScrollableConfigurationTable
      rows={[
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
      ]}
    />
  );
};

export default NetworkFormIpv4;
