import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import classnames from "classnames";
import { useInstanceLoading } from "context/instanceLoading";
import { Icon } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const InstanceStatusIcon: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const loadingType = instanceLoading.getType(instance);

  const getIconNameForStatus = (status: string) => {
    return (
      {
        Error: "status-failed-small",
        Frozen: "status-in-progress-small",
        Freezing: "spinner",
        Ready: "status-waiting-small",
        Running: "status-succeeded-small",
        Stopped: "status-queued-small",
      }[status] ?? ""
    );
  };

  return loadingType ? (
    <>
      <Icon className="u-animation--spin status-icon" name="spinner" />
      <i>{loadingType}</i>
    </>
  ) : (
    <>
      <Icon
        name={getIconNameForStatus(instance.status)}
        className={classnames("status-icon", {
          "u-animation--spin": instance.status === "Freezing",
        })}
      />
      {instance.status}
    </>
  );
};

export default InstanceStatusIcon;
