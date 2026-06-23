import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import classnames from "classnames";
import { useInstanceLoading } from "context/instanceLoading";
import { Icon } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  compact?: boolean;
}

const InstanceStatusIcon: FC<Props> = ({ instance, compact = false }) => {
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

  const getAbbreviation = (status: string) => {
    return (
      {
        Error: "E",
        Frozen: "F",
        Ready: "✓",
        Running: "R",
        Stopped: "S",
      }[status] ?? ""
    );
  };

  if (compact) {
    if (loadingType || instance.status === "Freezing") {
      return <Icon className="u-animation--spin status-icon" name="spinner" />;
    }
    return (
      <span
        className={`status-abbr status-abbr--${instance.status.toLowerCase()}`}
      >
        {getAbbreviation(instance.status)}
      </span>
    );
  }

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
