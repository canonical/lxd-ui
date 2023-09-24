import React, { FC } from "react";
import { CheckboxInput, Input, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import ConfigurationTable from "components/ConfigurationTable";
import { getNetworkConfigurationRow } from "pages/networks/forms/NetworkConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormIpv4: FC<Props> = ({ formik }) => {
  const hasDhcp =
    formik.values.ipv4_dhcp === true || formik.values.ipv4_dhcp === undefined;

  return (
    <ConfigurationTable
      rows={[
        getNetworkConfigurationRow({
          formik: formik,
          name: "ipv4_dhcp",
          label: "IPv4 DHCP",
          defaultValue: "",
          children: (
            <CheckboxInput
              label="IPv4 DHCP"
              checked={formik.values.ipv4_dhcp}
            />
          ),
        }),

        ...(formik.values.type !== "ovn" && hasDhcp
          ? [
              getNetworkConfigurationRow({
                formik: formik,
                name: "ipv4_dhcp_expiry",
                label: "IPv4 DHCP expiry",
                help: "When to expire DHCP leases",
                defaultValue: "",
                children: <Input type="text" />,
              }),

              getNetworkConfigurationRow({
                formik: formik,
                name: "ipv4_dhcp_ranges",
                label: "IPv4 DHCP ranges",
                help: "Comma-separated list of IP ranges to use for DHCP (FIRST-LAST format)",
                defaultValue: "",
                children: <Textarea />,
              }),
            ]
          : []),

        ...(formik.values.type === "ovn"
          ? [
              getNetworkConfigurationRow({
                formik: formik,
                name: "ipv4_l3only",
                label: "IPv4 L3 only",
                defaultValue: "",
                children: (
                  <CheckboxInput
                    label="IPv4 L3 only"
                    checked={formik.values.ipv4_l3only}
                  />
                ),
              }),
            ]
          : []),

        ...(formik.values.type !== "ovn" && formik.values.bridge_mode !== "fan"
          ? [
              getNetworkConfigurationRow({
                formik: formik,
                name: "ipv4_ovn_ranges",
                label: "IPv4 OVN ranges",
                help: "Comma-separated list of IPv4 ranges to use for child OVN network routers (FIRST-LAST format)",
                defaultValue: "",
                children: <Textarea />,
              }),
            ]
          : []),
      ]}
    />
  );
};

export default NetworkFormIpv4;
