import React from "react";
import { LxdInstance } from "types/instance";

export const getIpAddresses = (family: string, instance?: LxdInstance) => {
  return (
    instance?.state?.network?.eth0?.addresses
      .filter((item) => item.family === family)
      .map((item) => {
        return (
          <div
            key={item.address}
            className="ip u-truncate"
            title={item.address}
          >
            {item.address}
          </div>
        );
      }) ?? []
  );
};
