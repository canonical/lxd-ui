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

const NetworkFormIpv6: FC<Props> = ({ formik }) => {
  const hasDhcp = formik.values.ipv6_dhcp !== "false";

  return (
    <ScrollableConfigurationTable
      rows={[
        ...(formik.values.networkType !== "physical"
          ? [
              getConfigurationRow({
                formik,
                name: "ipv6_dhcp",
                label: "IPv6 DHCP",
                defaultValue: "",
                children: <Select options={optionTrueFalse} />,
              }),
            ]
          : []),

        ...(hasDhcp &&
        formik.values.networkType !== "ovn" &&
        formik.values.networkType !== "physical"
          ? [
              getConfigurationRow({
                formik,
                name: "ipv6_dhcp_expiry",
                label: "IPv6 DHCP expiry",
                defaultValue: "",
                children: <Input type="text" />,
              }),

              getConfigurationRow({
                formik,
                name: "ipv6_dhcp_ranges",
                label: "IPv6 DHCP ranges",
                defaultValue: "",
                children: <Textarea />,
              }),
            ]
          : []),

        ...(hasDhcp && formik.values.networkType !== "physical"
          ? [
              getConfigurationRow({
                formik,
                name: "ipv6_dhcp_stateful",
                label: "IPv6 DHCP stateful",
                defaultValue: "",
                children: <Select options={optionTrueFalse} />,
              }),
            ]
          : []),

        ...(formik.values.networkType === "ovn"
          ? [
              getConfigurationRow({
                formik,
                name: "ipv6_l3only",
                label: "IPv6 L3 only",
                defaultValue: "",
                children: <Select options={optionTrueFalse} />,
              }),
            ]
          : []),

        ...(formik.values.networkType !== "ovn"
          ? [
              getConfigurationRow({
                formik,
                name: "ipv6_ovn_ranges",
                label: "IPv6 OVN ranges",
                defaultValue: "",
                children: <Textarea />,
              }),
            ]
          : []),

        ...(formik.values.networkType === "physical"
          ? [
              getConfigurationRow({
                formik,
                name: "ipv6_gateway",
                label: "IPv6 gateway",
                defaultValue: "",
                children: <Textarea />,
              }),
              getConfigurationRow({
                formik,
                name: "ipv6_routes",
                label: "IPv6 routes",
                defaultValue: "",
                children: <Textarea />,
              }),
              getConfigurationRow({
                formik,
                name: "ipv6_routes_anycast",
                label: "IPv6 routes anycast",
                defaultValue: "",
                children: <Select options={optionTrueFalse} />,
              }),
            ]
          : []),
      ]}
    />
  );
};

export default NetworkFormIpv6;
