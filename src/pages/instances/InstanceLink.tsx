import React, { FC } from "react";
import { Link } from "react-router-dom";
import InstanceName from "pages/instances/InstanceName";

interface Props {
  instance: {
    name: string;
    project: string;
  };
}

const InstanceLink: FC<Props> = ({ instance }) => {
  return (
    <Link to={`/ui/${instance.project}/instances/detail/${instance.name}`}>
      <InstanceName instance={instance} />
    </Link>
  );
};

export default InstanceLink;
