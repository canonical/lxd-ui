import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import classnames from "classnames";

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
        <i className="p-icon--spinner u-animation--spin status-icon" />
        &nbsp;
        <i>{isStarting ? "Starting" : "Stopping"}</i>
      </>
    );
  }

  const getIconClassForStatus = (status: string) => {
    return {
      Error: "p-icon--status-failed-small",
      Frozen: "p-icon--status-in-progress-small",
      Freezing: "p-icon--spinner u-animation--spin",
      Ready: "p-icon--status-waiting-small",
      Running: "p-icon--status-succeeded-small",
      Stopped: "p-icon--status-queued-small",
    }[status];
  };

  return (
    <>
      <i
        className={classnames(
          getIconClassForStatus(instance.status),
          "status-icon"
        )}
      ></i>
      {instance.status}
    </>
  );
};

export default InstanceStatusIcon;
