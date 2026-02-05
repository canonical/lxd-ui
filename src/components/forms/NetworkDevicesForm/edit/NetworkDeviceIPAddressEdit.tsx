import { type FC } from "react";
import { type LxdNetwork } from "types/network";
import { typesWithNicStaticIPSupport } from "util/networks";
import type { NetworkDeviceFormValues } from "types/forms/networkDevice";
import type { FormikProps } from "formik";
import PrefixedIpInput from "components/PrefixedIpInput";

interface Props {
  formik: FormikProps<NetworkDeviceFormValues>;
  network?: LxdNetwork;
  family: "IPv4" | "IPv6";
}

const NetworkDeviceIPAddressEdit: FC<Props> = ({ formik, network, family }) => {
  if (!network || !network.config) {
    return null;
  }

  const networkFieldName = family === "IPv4" ? "ipv4.address" : "ipv6.address";
  const ipAddressConfigValue = network.config?.[networkFieldName];
  const formikFieldName = family.toLowerCase() as keyof NetworkDeviceFormValues;

  const isEnabled =
    network?.managed &&
    typesWithNicStaticIPSupport.includes(network.type) &&
    ipAddressConfigValue !== "none" &&
    ipAddressConfigValue !== undefined;
  return (
    <PrefixedIpInput
      id={formikFieldName}
      name={formikFieldName}
      cidr={ipAddressConfigValue || ""}
      ip={formik.values[formikFieldName] || ""}
      label={`${family} address reservation`}
      onIpChange={(ip: string) => {
        formik.setFieldValue(formikFieldName, ip);
      }}
      onBlur={() => {
        void formik.setFieldTouched(formikFieldName, true);
      }}
      disabled={!isEnabled}
      help={!isEnabled && `Static ${family} is not available for this network`}
    />
  );
};

export default NetworkDeviceIPAddressEdit;
