import type { FC } from "react";
import classnames from "classnames";
import { Icon } from "@canonical/react-components";

interface Props {
  status: string;
}

const getIconNameForStatus = (status: string): string => {
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

const InstanceStatus: FC<Props> = ({ status }) => {
  return (
    <>
      <Icon
        name={getIconNameForStatus(status)}
        className={classnames("status-icon", {
          "u-animation--spin": status === "Freezing",
        })}
      />
      {status}
    </>
  );
};

export default InstanceStatus;
