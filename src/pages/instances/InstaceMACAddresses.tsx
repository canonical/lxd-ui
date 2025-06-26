import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import ExpandableList from "components/ExpandableList";

interface Props {
  instance: LxdInstance;
}

const InstanceMACAddresses: FC<Props> = ({ instance }) => {
  const extractAddressesFromConfig = () => {
    const hwaddrs = [];

    for (const [key, value] of Object.entries(instance.config)) {
      if (
        key.startsWith("volatile.") &&
        key.endsWith(".hwaddr") &&
        key.split(".").length === 3
      ) {
        hwaddrs.push(value);
      }
    }
    return hwaddrs;
  };

  const macAddresses = extractAddressesFromConfig();

  return macAddresses.length ? (
    <ExpandableList
      items={macAddresses.map((macAddress) => (
        <div
          key={macAddress}
          className="ip u-truncate"
          title={`MAC address ${macAddress}`}
        >
          {macAddress}
        </div>
      ))}
    />
  ) : (
    <>-</>
  );
};

export default InstanceMACAddresses;
