import { type FC } from "react";
import { type LxdNetwork } from "types/network";
import { type LxdNicDevice } from "types/device";

interface Props {
  network?: LxdNetwork;
  device: LxdNicDevice;
  family: "IPv4" | "IPv6";
}

export const NetworkDeviceIPAddressRead: FC<Props> = ({
  network,
  device,
  family,
}) => {
  if (!network || !network.config) {
    return null;
  }

  const addressString = family === "IPv4" ? "ipv4.address" : "ipv6.address";
  const networkIP = network.config[addressString];
  const deviceIP = device[addressString];

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
};
