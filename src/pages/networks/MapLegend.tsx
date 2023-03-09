import React, { FC } from "react";
import { List } from "@canonical/react-components";

const MapLegend: FC = () => {
  return (
    <List
      className="legend"
      items={[
        <div key="instance" style={{ display: "inline-flex" }}>
          <span className="legend-item instance other" />
          Instance (running)
        </div>,
        <div key="instance" style={{ display: "inline-flex" }}>
          <span className="legend-item instance running" />
          Instance (other status)
        </div>,
        <div key="network" style={{ display: "inline-flex" }}>
          <span className="legend-item network" />
          Network
        </div>,
      ]}
    />
  );
};

export default MapLegend;
