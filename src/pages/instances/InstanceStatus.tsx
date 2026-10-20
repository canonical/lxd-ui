import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import DsIcon from "components/DsIcon";

interface Props {
  status: string;
}

const getIconNameForStatus = (status: string): string => {
  return (
    {
      Error: "status-failed-small",
      Frozen: "status-in-progress-small",
      Ready: "status-waiting-small",
      Running: "status-succeeded-small",
      Stopped: "status-queued-small",
    }[status] ?? "status-queued-small"
  );
};

const InstanceStatus: FC<Props> = ({ status }) => {
  if (status === "Freezing") {
    return (
      <>
        <DsIcon className="u-animation--spin status-icon" icon="spinner" />
        {status}
      </>
    );
  }

  return (
    <>
      <Icon name={getIconNameForStatus(status)} className="status-icon" />
      {status}
    </>
  );
};

export default InstanceStatus;
