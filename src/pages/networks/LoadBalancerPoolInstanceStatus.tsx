import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { capitalizeFirstLetter } from "util/helpers";

interface Props {
  status?: string;
}

const getIcon = (status: string): string => {
  switch (status) {
    case "online":
      return "status-succeeded-small";
    case "offline":
      return "status-failed-small";
    case "unknown":
    default:
      return "status-queued-small";
  }
};

const LoadBalancerPoolInstanceStatus: FC<Props> = ({ status }) => {
  const normalizedStatus = status?.trim() ? status : "unknown";

  const icon = getIcon(normalizedStatus);
  return (
    <>
      <Icon name={icon} className="status-icon" />
      {capitalizeFirstLetter(normalizedStatus)}
    </>
  );
};

export default LoadBalancerPoolInstanceStatus;
