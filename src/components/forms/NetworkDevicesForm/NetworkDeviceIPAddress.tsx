import { type FC } from "react";
import type { InstanceAndProfileFormikProps } from "../instanceAndProfileFormValues";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { Input } from "@canonical/react-components";
import { type LxdNetwork } from "types/network";
import { type LxdNicDevice } from "types/device";
import { typesWithNicStaticIPSupport } from "util/networks";

interface Props {
  formik: InstanceAndProfileFormikProps;
  index: number;
  network?: LxdNetwork;
  device: LxdNicDevice;
  family: "IPv4" | "IPv6";
}

export const NetworkDeviceIPAddress: FC<Props> = ({
  formik,
  index,
  network,
  device,
  family,
}) => {
  if (!network || !network.config) {
    return null;
  }

  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const addressString = family === "IPv4" ? "ipv4.address" : "ipv6.address";
  const networkIP = network.config[addressString];
  const deviceIP = device[addressString];
  const isStaticIPAllowed =
    network.managed && typesWithNicStaticIPSupport.includes(network.type);
  const canSelectIP = isStaticIPAllowed && networkIP && networkIP !== "none";

  if (readOnly) {
    return (
      networkIP !== "none" && (
        <div className="ip-content">
          <>
            <div>{family}</div>
            <div className="mono-font">
              <b>{deviceIP || "dynamic"}</b>
            </div>
          </>
        </div>
      )
    );
  }

  return (
    <div className="ip-content-edit">
      <Input
        id={`${addressString}-${index}`}
        name={`${addressString}-${index}`}
        label={`${family} address reservation`}
        type="text"
        placeholder={`Enter ${family} address`}
        onChange={(e) => {
          formik.setFieldValue(
            `devices.${index}["${addressString}"]`,
            e.target.value,
          );
        }}
        value={deviceIP}
        disabled={!canSelectIP}
        help={
          <>
            {canSelectIP
              ? `Choose an ${family} within the subnet range ${networkIP}, or leave it empty to be dynamically set.`
              : `Static ${family} is not available for this network`}
          </>
        }
      />
    </div>
  );
};
