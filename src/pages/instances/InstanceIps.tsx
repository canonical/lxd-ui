import React, { FC } from "react";
import { getIpAddresses } from "util/networks";
import { LxdInstance } from "types/instance";
import ExpandableList from "components/ExpandableList";

interface Props {
  instance: LxdInstance;
  family: "inet" | "inet6";
}

const InstanceIps: FC<Props> = ({ instance, family }) => {
  const addresses = getIpAddresses(instance, family);
  return addresses.length ? (
    <ExpandableList
      items={addresses.map((address) => (
        <div key={address} className="ip u-truncate" title={address}>
          {address}
        </div>
      ))}
    />
  ) : (
    <>-</>
  );
};

export default InstanceIps;
