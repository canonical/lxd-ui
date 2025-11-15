import { type FC, useState } from "react";
import type { InstanceAndProfileFormikProps } from "../instanceAndProfileFormValues";
import { Input } from "@canonical/react-components";
import { type LxdNetwork } from "types/network";
import { type LxdNicDevice } from "types/device";
import { typesWithStaticIP } from "util/networks";

interface Props {
  formik: InstanceAndProfileFormikProps;
  index: number;
  network?: LxdNetwork;
  device: LxdNicDevice;
  readOnly: boolean;
}

export const NetworkDeviceIPAddress: FC<Props> = ({
  formik,
  index,
  network,
  device,
  readOnly,
}) => {
  const [ipv4Address, setipv4Address] = useState(device["ipv4.address"] || "");
  const [ipv6Address, setipv6Address] = useState(device["ipv6.address"] || "");

  if (!network || !network.config) {
    return null;
  }

  const config = network.config;

  const getNetworkIPv4 = () => {
    return config["ipv4.address"];
  };

  const getNetworkIPv6 = () => {
    return config["ipv6.address"];
  };

  const isStaticIPAllowed = () => {
    return network.managed && typesWithStaticIP.includes(network.type);
  };

  const canSelectIPv4 = () => {
    return (
      isStaticIPAllowed() &&
      config["ipv4.address"] &&
      config["ipv4.address"] != "none"
    );
  };

  const canSelectIPv6 = () => {
    return (
      isStaticIPAllowed() &&
      config["ipv6.address"] &&
      config["ipv6.address"] != "none"
    );
  };

  if (readOnly) {
    return (
      <div className="ip-content">
        {device["ipv4.address"] && (
          <>
            <div>IPv4</div>
            <p className="u-no-margin--top u-no-margin--bottom">
              {(formik.values.devices[index] as LxdNicDevice)["ipv4.address"]}
            </p>
          </>
        )}
        {device["ipv6.address"] && (
          <>
            <div>IPv6</div>
            <p className="u-no-margin--top">
              {(formik.values.devices[index] as LxdNicDevice)["ipv6.address"]}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <label
        className={canSelectIPv4() ? "" : "u-text--muted"}
        htmlFor={`$ipv4-address-${index}`}
      >
        IPv4 address
      </label>
      <Input
        id={`ipv4-address-${index}`}
        name={`ipv4-address-${index}`}
        aria-label="IPv4 address"
        type="text"
        placeholder="Enter IPv4 address"
        onChange={(e) => {
          setipv4Address(e.target.value);
          formik.setFieldValue(
            `devices.${index}["ipv4.address"]`,
            e.target.value,
          );
        }}
        value={ipv4Address}
        disabled={!canSelectIPv4()}
        help={
          <>
            {canSelectIPv4()
              ? `Use CIDR notation in the range ${getNetworkIPv4()}, or leave it empty to use a dynamic IPv4 address.`
              : "Static IPv4 is not available for this network"}
          </>
        }
      />
      <label
        className={canSelectIPv6() ? "" : "u-text--muted"}
        htmlFor={`$ipv6-address-${index}`}
      >
        IPv6 address
      </label>
      <Input
        id={`ipv6-address-${index}`}
        name={`ipv6-address-${index}`}
        aria-label="IPv6 address"
        type="text"
        placeholder="Enter IPv6 address"
        onChange={(e) => {
          setipv6Address(e.target.value);
          formik.setFieldValue(
            `devices.${index}["ipv6.address"]`,
            e.target.value,
          );
        }}
        value={ipv6Address}
        disabled={!canSelectIPv6()}
        help={
          <>
            {canSelectIPv6()
              ? `Use CIDR notation in the range ${getNetworkIPv6()}, or leave it empty to use a dynamic IPv6 address.`
              : "Static IPv6 is not available for this network"}
          </>
        }
      />
    </>
  );
};
