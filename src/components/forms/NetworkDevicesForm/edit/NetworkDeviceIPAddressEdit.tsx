import { type FC } from "react";
import { type LxdNetwork } from "types/network";
import type { NetworkDeviceFormValues } from "types/forms/networkDevice";
import type { FormikProps } from "formik";
import { Input, PrefixedIpInput } from "@canonical/react-components";
import { getNicIpDisableReason } from "util/devices";
import { getNetworkMetadata } from "util/configInheritance";

interface Props {
  formik: FormikProps<NetworkDeviceFormValues>;
  network: LxdNetwork;
  family: "IPv4" | "IPv6";
}

const NetworkDeviceIPAddressEdit: FC<Props> = ({ formik, network, family }) => {
  if (!network || !network.config) {
    return null;
  }

  const networkFieldName = family === "IPv4" ? "ipv4.address" : "ipv6.address";
  const formFieldName = family.toLowerCase() as keyof NetworkDeviceFormValues;
  const networkCIDR = network.config?.[networkFieldName];
  const nicIP = formik.values[formFieldName];
  const dhcpDefault = getNetworkMetadata(
    network.type,
    family === "IPv4" ? "ipv4_dhcp" : "ipv6_dhcp",
  );
  const dhcpStatefulDefault = getNetworkMetadata(
    network.type,
    "ipv6_dhcp_stateful",
  );
  const disableReason = getNicIpDisableReason(
    formik.values,
    network,
    family,
    dhcpDefault.value,
    dhcpStatefulDefault.value,
  );

  if (disableReason) {
    return (
      <Input
        id={networkFieldName}
        label={`${family} address reservation`}
        type="text"
        disabled
        help={disableReason}
        value="-"
      />
    );
  }
  return (
    <PrefixedIpInput
      id={networkFieldName}
      name={networkFieldName}
      cidr={networkCIDR || ""}
      ip={nicIP || ""}
      label={`${family} address reservation`}
      onIpChange={(ip: string) => {
        formik.setFieldValue(formFieldName, ip);
      }}
      onBlur={() => {
        void formik.setFieldTouched(formFieldName, true);
      }}
      error={
        formik.touched[formFieldName] ? formik.errors[formFieldName] : undefined
      }
      help={family === "IPv6" && <></>}
    />
  );
};

export default NetworkDeviceIPAddressEdit;
