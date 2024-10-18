import { FC } from "react";
import ResourceIcon, { ResourceIconType } from "./ResourceIcon";

interface Props {
  type: ResourceIconType;
  value: string;
  bold?: boolean;
}

const ResourceLabel: FC<Props> = ({ type, value, bold }) => {
  const ValueWrapper = bold ? "strong" : "span";
  return (
    <span className="resource-label u-truncate">
      <ResourceIcon type={type} />
      <ValueWrapper>{value}</ValueWrapper>
    </span>
  );
};

export default ResourceLabel;
