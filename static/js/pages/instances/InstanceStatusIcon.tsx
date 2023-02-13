import React, { FC } from "react";
import { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
  isStarting: boolean;
  isStopping: boolean;
}

const InstanceStatusIcon: FC<Props> = ({
  instance,
  isStarting,
  isStopping,
}) => {
  if (isStarting || isStopping) {
    return (
      <>
        <i className="p-icon--spinner u-animation--spin" />
        &nbsp;
        <i>{isStarting ? "Starting" : "Stopping"}</i>
      </>
    );
  }

  const getIconClassForStatus = (status: string) => {
    return {
      Error: "p-icon--oval-red",
      Frozen: "p-icon--oval-blue",
      Freezing: "p-icon--spinner u-animation--spin",
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
