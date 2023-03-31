import React, { FC, ReactNode } from "react";
import { LxdInstance } from "types/instance";
import { LxdNetwork } from "types/network";
import { createRoot } from "react-dom/client";
import InstanceName from "pages/instances/InstanceName";

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
    return (
      <div className="p-text--small tooltip">
        <a href={`/ui/${instance.project}/instances/detail/${instance.name}`}>
          <InstanceName instance={instance} />
        </a>
        <br />
        Status: <i>{instance.status}</i>
        <br />
        IPs:{" "}
        <ul className="p-list u-no-margin--bottom">
          {instance.state?.network?.eth0?.addresses.map((item) => (
            <li key={item.address} className="p-list__item">
              {item.address}
            </li>
          )) ?? <li>None</li>}
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
