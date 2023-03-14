import React, { FC } from "react";
import { Link } from "react-router-dom";

interface Props {
  instance: {
    name: string;
    project: string;
  };
}

const InstanceLink: FC<Props> = ({ instance }) => {
  return (
    <Link to={`/ui/${instance.project}/instances/detail/${instance.name}`}>
      {instance.name}
    </Link>
  );
};

export default InstanceLink;
