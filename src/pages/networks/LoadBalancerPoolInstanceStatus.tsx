import type { FC } from "react";
import { capitalizeFirstLetter } from "util/helpers";
import type { StatusTone } from "util/statusColors";
import StatusIcon from "components/StatusIcon";

interface Props {
  status?: string;
}

const getTone = (status: string): StatusTone => {
  switch (status) {
    case "online":
      return "positive";
    case "offline":
      return "negative";
    case "unknown":
    default:
      return "neutral";
  }
};

const LoadBalancerPoolInstanceStatus: FC<Props> = ({ status }) => {
  const normalizedStatus = status?.trim() ? status : "unknown";

  const tone = getTone(normalizedStatus);
  return (
    <>
      <StatusIcon tone={tone} className="status-icon" />
      {capitalizeFirstLetter(normalizedStatus)}
    </>
  );
};

export default LoadBalancerPoolInstanceStatus;
