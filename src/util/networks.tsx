import React from "react";
import { LxdInstance } from "types/instance";

export const getIpAddresses = (
  instance: LxdInstance,
  family?: string,
  showLocal = true
) => {
  if (!instance.state?.network) return [];
  const interfaces = Object.entries(instance.state.network).filter(
    ([key, _value]) => key !== "lo"
  );
  const addresses = interfaces.flatMap(([_key, value]) => value.addresses);
  const filteredAddresses =
    !family && showLocal
      ? addresses
      : addresses.filter(
          (item) =>
            (family ? item.family === family : true) &&
            (showLocal
              ? true
              : !(
                  item.address.startsWith("127") ||
                  item.address.startsWith("fe80")
                ))
        );
  return filteredAddresses.map((item) => item.address);
};

export const getIpAddressElements = (instance: LxdInstance, family: string) => {
  return getIpAddresses(instance, family).map((address) => {
    return (
      <div key={address} className="ip u-truncate" title={address}>
        {address}
      </div>
    );
  });
};
