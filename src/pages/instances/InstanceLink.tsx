import React, { FC } from "react";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";

interface Props {
  instance: {
    name: string;
    project: string;
  };
}

const InstanceLink: FC<Props> = ({ instance }) => {
  return (
    <Link
      to={`/ui/project/${instance.project}/instances/detail/${instance.name}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ItemName item={instance} />
    </Link>
  );
};

export default InstanceLink;
