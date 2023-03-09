import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import EditInstanceForm from "pages/instances/EditInstanceForm";

interface Props {
  instance: LxdInstance;
}

const InstanceConfiguration: FC<Props> = ({ instance }) => {
  return <EditInstanceForm instance={instance} />;
};

export default InstanceConfiguration;
