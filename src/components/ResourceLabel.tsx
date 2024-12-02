import { FC } from "react";
import ResourceIcon, { ResourceIconType } from "./ResourceIcon";
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
    <span className={classNames("resource-label", { "u-truncate": truncate })}>
      <ResourceIcon type={type} />
      <ValueWrapper title={value}>{value}</ValueWrapper>
    </span>
  );
};

export default ResourceLabel;
