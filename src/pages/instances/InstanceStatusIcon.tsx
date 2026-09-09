import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useInstanceLoading } from "context/instanceLoading";
import { Icon } from "@canonical/react-components";
import DsIcon from "components/DsIcon";

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
        Ready: "status-waiting-small",
        Running: "status-succeeded-small",
        Stopped: "status-queued-small",
      }[status] ?? ""
    );
  };

  if (loadingType) {
    return (
      <>
        <DsIcon className="u-animation--spin status-icon" icon="spinner" />
        <i>{loadingType}</i>
      </>
    );
  }

  if (instance.status === "Freezing") {
    return (
      <>
        <DsIcon className="u-animation--spin status-icon" icon="spinner" />
        {instance.status}
      </>
    );
  }

  return (
    <>
      <Icon
        name={getIconNameForStatus(instance.status)}
        className="status-icon"
      />
      {instance.status}
    </>
  );
};

export default InstanceStatusIcon;
