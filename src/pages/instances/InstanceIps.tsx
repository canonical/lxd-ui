import type { FC } from "react";
import { getIpAddresses, sortIpv6Addresses } from "util/networks";
import type { IpFamily, LxdInstance } from "types/instance";
import ExpandableList from "components/ExpandableList";

interface Props {
  instance: LxdInstance;
  family: IpFamily;
}

const InstanceIps: FC<Props> = ({ instance, family }) => {
  const addresses = getIpAddresses(instance, family);
  const sortedAddresses =
    family === "inet6" ? sortIpv6Addresses(addresses) : addresses;
  return addresses.length ? (
    <ExpandableList
      items={sortedAddresses.map((item) => (
        <div
          key={item.address}
          className="ip u-truncate"
          title={`IP ${item.address} (${item.iface})`}
        >
          {item.address} ({item.iface})
        </div>
      ))}
    />
  ) : (
    <>-</>
  );
};

export default InstanceIps;
