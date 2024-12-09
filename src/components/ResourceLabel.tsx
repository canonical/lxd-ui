import { FC } from "react";
import ResourceIcon, { ResourceIconType } from "./ResourceIcon";
import classNames from "classnames";

interface Props {
  type: ResourceIconType;
  value: string;
  bold?: boolean;
  fullWidth?: boolean;
}

const ResourceLabel: FC<Props> = ({ type, value, bold, fullWidth }) => {
  const ValueWrapper = bold ? "strong" : "span";
  return (
    <span className={classNames("resource-label", { "u-truncate": fullWidth })}>
      <ResourceIcon type={type} />
      <ValueWrapper>{value}</ValueWrapper>
    </span>
  );
};

export default ResourceLabel;
