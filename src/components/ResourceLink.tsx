import type { FC } from "react";
import { Link } from "react-router-dom";
import type { ResourceIconType } from "./ResourceIcon";
import ResourceIcon from "./ResourceIcon";
import classnames from "classnames";

interface Props {
  type: ResourceIconType;
  value: string;
  to: string;
  disabled?: boolean;
  className?: string;
}

const ResourceLink: FC<Props> = ({ type, value, to, disabled, className }) => {
  return (
    <Link
      className={classnames(
        "p-chip is-inline is-dense resource-link",
        {
          "p-chip--disabled": disabled,
        },
        className,
      )}
      to={to}
      title={value}
    >
      <ResourceIcon type={type} />
      <span className="p-chip__value">{value}</span>
    </Link>
  );
};

export default ResourceLink;
