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
}

const ResourceLink: FC<Props> = ({ type, value, to, disabled }) => {
  return (
    <Link
      className={classnames("p-chip is-inline is-dense resource-link", {
        "p-chip--disabled": disabled,
      })}
      to={to}
      title={value}
    >
      <span className="p-chip__value">
        <ResourceIcon type={type} />
        {value}
      </span>
    </Link>
  );
};

export default ResourceLink;
