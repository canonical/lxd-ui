import type { FC } from "react";
import type { ResourceIconType } from "./ResourceIcon";
import ResourceIcon from "./ResourceIcon";
import classNames from "classnames";

interface Props {
  type: ResourceIconType;
  value: string;
  bold?: boolean;
  truncate?: boolean;
}

const ResourceLabel: FC<Props> = ({ type, value, bold, truncate = true }) => {
  const ValueWrapper = bold ? "strong" : "span";
  return (
    <span
      className={classNames("resource-label", { "u-truncate": truncate })}
      title={value}
    >
      <ResourceIcon type={type} />
      <ValueWrapper>{value}</ValueWrapper>
    </span>
  );
};

export default ResourceLabel;
