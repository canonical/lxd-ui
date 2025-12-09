import { type FC } from "react";
import { Input } from "@canonical/react-components";
import { type LxdNetwork } from "types/network";
import { typesWithNicStaticIPSupport } from "util/networks";
import type { NetworkDeviceFormValues } from "components/forms/NetworkDevicesForm/edit/NetworkDevicePanel";
import type { FormikProps } from "formik";

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
    ipAddressConfigValue !== "none";

  return (
    <Input
      id={formikFieldName}
      name={formikFieldName}
      type="text"
      label={`${family} address reservation`}
      placeholder={`Enter ${family} address`}
      value={formik.values[formikFieldName] || ""}
      onChange={(e) => {
        void formik.setFieldValue(formikFieldName, e.target.value);
      }}
      onBlur={() => {
        void formik.setFieldTouched(formikFieldName, true);
      }}
      disabled={!isEnabled}
      help={
        isEnabled
          ? `Choose an ${family} address within the subnet range ${ipAddressConfigValue || ""}, or leave empty for dynamic assignment`
          : `Static ${family} is not available for this network`
      }
    />
  );
};

export default NetworkDeviceIPAddressEdit;
