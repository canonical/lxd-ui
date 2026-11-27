import type { FC } from "react";
import DsIcon from "components/DsIcon";
import StatusIcon from "components/StatusIcon";
import type { StatusTone } from "util/statusColors";

interface Props {
  status: string;
}

const getToneForStatus = (status: string): StatusTone => {
  return (
    (
      {
        Error: "negative",
        Frozen: "information",
        Ready: "caution",
        Running: "positive",
        Stopped: "neutral",
      } as const
    )[status] ?? "neutral"
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
      <StatusIcon tone={getToneForStatus(status)} className="status-icon" />
      {status}
    </>
  );
};

export default InstanceStatus;
