import { FC } from "react";
import { Link } from "react-router-dom";
import ResourceIcon, { ResourceIconType } from "./ResourceIcon";

interface Props {
  type: ResourceIconType;
  value: string;
  to: string;
}

const ResourceLink: FC<Props> = ({ type, value, to }) => {
  return (
    <Link
      className="p-chip is-inline is-dense resource-link"
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
