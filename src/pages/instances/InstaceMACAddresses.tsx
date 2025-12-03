import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import ExpandableList from "components/ExpandableList";
import { getInstanceMacAddresses } from "util/instances";

interface Props {
  instance: LxdInstance;
}

const InstanceMACAddresses: FC<Props> = ({ instance }) => {
  const macAddresses = getInstanceMacAddresses(instance);

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
