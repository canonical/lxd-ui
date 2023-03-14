import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import classnames from "classnames";
import { useInstanceLoading } from "context/instanceLoading";

interface Props {
  instance: LxdInstance;
}

const InstanceStatusIcon: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const loadingState = instanceLoading.getType(instance);

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

  return loadingState ? (
    <>
      <i className="p-icon--spinner u-animation--spin status-icon" />
      <i>{loadingState}</i>
    </>
  ) : (
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
