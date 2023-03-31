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
    <Link to={`/ui/${instance.project}/instances/detail/${instance.name}`}>
      <ItemName item={instance} />
    </Link>
  );
};

export default InstanceLink;
