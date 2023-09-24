import React, { FC } from "react";
import { CheckboxInput, Input, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import ConfigurationTable from "pages/networks/forms/ConfigurationTable";
import { getConfigurationRowNetwork } from "pages/networks/forms/ConfigurationRowNetwork";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormIpv6: FC<Props> = ({ formik }) => {
  const hasDhcp =
    formik.values.ipv6_dhcp === true || formik.values.ipv6_dhcp === undefined;

  return (
    <ConfigurationTable
      rows={[
        getConfigurationRowNetwork({
          formik: formik,
          name: "ipv6_dhcp",
          label: "IPv6 DHCP",
          defaultValue: "",
          children: (
            <CheckboxInput
              label="IPv6 DHCP"
              checked={formik.values.ipv6_dhcp}
            />
          ),
        }),

        ...(hasDhcp && formik.values.type !== "ovn"
          ? [
              getConfigurationRowNetwork({
                formik: formik,
                name: "ipv6_dhcp_expiry",
                label: "IPv6 DHCP expiry",
                help: "When to expire DHCP leases",
                defaultValue: "",
                children: <Input type="text" />,
              }),

              getConfigurationRowNetwork({
                formik: formik,
                name: "ipv6_dhcp_ranges",
                label: "IPv6 DHCP ranges",
                help: "Comma-separated list of IPv6 ranges to use for DHCP (FIRST-LAST format)",
                defaultValue: "",
                children: <Textarea />,
              }),
            ]
          : []),

        ...(hasDhcp
          ? [
              getConfigurationRowNetwork({
                formik: formik,
                name: "ipv6_dhcp_stateful",
                label: "IPv6 DHCP stateful",
                defaultValue: "",
                children: (
                  <CheckboxInput
                    label="IPv6 DHCP stateful"
                    checked={formik.values.ipv6_dhcp_stateful}
                  />
                ),
              }),
            ]
          : []),

        ...(formik.values.type === "ovn"
          ? [
              getConfigurationRowNetwork({
                formik: formik,
                name: "ipv6_l3only",
                label: "IPv6 L3 only",
                defaultValue: "",
                children: (
                  <CheckboxInput
                    label="IPv6 L3 only"
                    checked={formik.values.ipv6_l3only}
                  />
                ),
              }),
            ]
          : []),

        ...(formik.values.type !== "ovn"
          ? [
              getConfigurationRowNetwork({
                formik: formik,
                name: "ipv6_ovn_ranges",
                label: "IPv6 OVN ranges",
                help: "Comma-separated list of IPv6 ranges to use for child OVN network routers (FIRST-LAST format)",
                defaultValue: "",
                children: <Textarea />,
              }),
            ]
          : []),
      ]}
    />
  );
};

export default NetworkFormIpv6;
