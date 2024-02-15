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
        getConfigurationRow({
          formik,
          name: "ipv4_dhcp",
          label: "IPv4 DHCP",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        ...(formik.values.networkType !== "ovn" && hasDhcp
          ? [
              getConfigurationRow({
                formik,
                name: "ipv4_dhcp_expiry",
                label: "IPv4 DHCP expiry",
                help: "When to expire DHCP leases",
                defaultValue: "",
                children: <Input type="text" />,
              }),

              getConfigurationRow({
                formik,
                name: "ipv4_dhcp_ranges",
                label: "IPv4 DHCP ranges",
                help: "Comma-separated list of IP ranges to use for DHCP (FIRST-LAST format)",
                defaultValue: "",
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
