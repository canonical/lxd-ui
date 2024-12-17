import { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { optionTrueFalse } from "util/instanceOptions";
import IpAddressSelector from "pages/networks/forms/IpAddressSelector";
import ConfigurationTable from "components/ConfigurationTable";
import { IPV6 } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkFormIpv6: FC<Props> = ({ formik }) => {
  const hasDhcp = formik.values.ipv6_dhcp !== "false";

  return (
    <>
      <h2 className="p-heading--4" id={slugify(IPV6)}>
        IPv6
      </h2>
      <ConfigurationTable
        rows={[
          ...(formik.values.networkType !== "physical"
            ? [
                getConfigurationRow({
                  formik,
                  name: "ipv6_address",
                  label: "IPv6 address range",
                  defaultValue: "auto",
                  children: (
                    <IpAddressSelector
                      id="ipv6_address"
                      family="IPv6"
                      address={formik.values.ipv6_address}
                      setAddress={(value) => {
                        void formik.setFieldValue("ipv6_address", value);

                        if (value === "none") {
                          const nullFields = [
                            "ipv6_nat",
                            "ipv6_dhcp",
                            "ipv6_dhcp_expiry",
                            "ipv6_dhcp_ranges",
                            "ipv6_dhcp_stateful",
                            "ipv6_ovn_ranges",
                          ];
                          nullFields.forEach(
                            (field) =>
                              void formik.setFieldValue(field, undefined),
                          );
                        }
                      }}
                    />
                  ),
                }),

                getConfigurationRow({
                  formik,
                  name: "ipv6_nat",
                  label: "IPv6 NAT",
                  defaultValue: "",
                  children: <Select options={optionTrueFalse} />,
                  disabled: formik.values.ipv6_address === "none",
                  disabledReason: "IPv6 address is set to none",
                }),
              ]
            : []),

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

          ...(formik.values.networkType !== "ovn" &&
          formik.values.networkType !== "physical"
            ? [
                getConfigurationRow({
                  formik,
                  name: "ipv6_dhcp_expiry",
                  label: "IPv6 DHCP expiry",
                  defaultValue: "",
                  disabled: !hasDhcp,
                  disabledReason: "IPv6 DHCP is disabled",
                  children: <Input type="text" />,
                }),

                getConfigurationRow({
                  formik,
                  name: "ipv6_dhcp_ranges",
                  label: "IPv6 DHCP ranges",
                  defaultValue: "",
                  disabled: !hasDhcp,
                  disabledReason: "IPv6 DHCP is disabled",
                  children: <Textarea />,
                }),
              ]
            : []),

          ...(formik.values.networkType !== "physical"
            ? [
                getConfigurationRow({
                  formik,
                  name: "ipv6_dhcp_stateful",
                  label: "IPv6 DHCP stateful",
                  defaultValue: "",
                  disabled: !hasDhcp,
                  disabledReason: "IPv6 DHCP is disabled",
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

          ...(["bridge", "physical"].includes(formik.values.networkType)
            ? [
                getConfigurationRow({
                  formik,
                  name: "ipv6_routes",
                  label: "IPv6 routes",
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
                  name: "ipv6_routes_anycast",
                  label: "IPv6 routes anycast",
                  defaultValue: "",
                  children: <Select options={optionTrueFalse} />,
                }),
              ]
            : []),
        ]}
      />
    </>
  );
};

export default NetworkFormIpv6;
