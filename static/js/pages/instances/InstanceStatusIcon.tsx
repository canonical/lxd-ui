import React, { FC } from "react";
import { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
}

const InstanceStatusIcon: FC<Props> = ({ instance }) => {
  // todo: which states are used - can error/unknown/init be removed?
  const getIconClassForStatus = (status: string) => {
    return {
      Error: "p-icon--oval-red",
      Frozen: "p-icon--oval-blue",
      Ready: "p-icon--oval-yellow",
      Running: "p-icon--oval-green",
      Stopped: "p-icon--oval-grey",
    }[status];
  };

  return (
    <>
      <i className={getIconClassForStatus(instance.status)}></i>
      &nbsp;
      {instance.status}
    </>
  );
};

export default InstanceStatusIcon;
