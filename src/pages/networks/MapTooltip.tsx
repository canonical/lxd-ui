import React, { FC, ReactNode } from "react";
import { LxdInstance } from "types/instance";
import { LxdNetwork } from "types/network";
import { createRoot } from "react-dom/client";
import ItemName from "components/ItemName";
import { getIpAddresses } from "util/networks";

export interface MapTooltipProps {
  type: string;
  item: LxdInstance | LxdNetwork;
}

export const mountElement = (component: ReactNode) => {
  const element = document.createElement("div");
  element.className = "map-tooltip";
  const root = createRoot(element);
  root.render(component);
  document.getElementById("network-map")?.appendChild(element);
  return element;
};

const MapTooltip: FC<MapTooltipProps> = ({ item, type }) => {
  if (type === "instance") {
    const instance = item as LxdInstance;

    const ipAddresses = getIpAddresses(instance, "inet")
      .concat(getIpAddresses(instance, "inet6"))
      .map((address) => (
        <li key={address} className="p-list__item">
          {address}
        </li>
      ));

    return (
      <div className="p-text--small tooltip">
        <a
          href={`/ui/project/${instance.project}/instances/detail/${instance.name}`}
        >
          <ItemName item={instance} />
        </a>
        <br />
        Status: <i>{instance.status}</i>
        <br />
        IPs:{" "}
        <ul className="p-list u-no-margin--bottom">
          {ipAddresses.length > 0 ? ipAddresses : <li>None</li>}
        </ul>
      </div>
    );
  }
  if (type === "network") {
    const network = item as LxdNetwork;
    return (
      <div className="p-text--small tooltip">
        {network.name}
        <br />
        Status: <i>{network.status !== "" ? network.status : "None"}</i>
        <br />
        Type: {network.type}
      </div>
    );
  }
  return null;
};

export default MapTooltip;
