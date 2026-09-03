import { type FC } from "react";
import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "util/helpers";
import type { LxdInstanceStatus } from "types/instance";

interface Props {
  status: "running" | "stopped" | "frozen" | "error";
  count: number;
  instancesUrl: string;
}

const InstancesOverviewStatus: FC<Props> = ({
  status,
  count,
  instancesUrl,
}) => {
  const getStatusFilterHref = (status: LxdInstanceStatus) => {
    const params = new URLSearchParams();
    params.append("status", status);
    return `${instancesUrl}?${params.toString()}`;
  };

  return (
    <div className={`group-by-status ${status}`}>
      <p className="status-label u-text--muted">
        {capitalizeFirstLetter(status)}
      </p>
      <Link
        className="status-link p-link--soft"
        to={getStatusFilterHref(
          capitalizeFirstLetter(status) as LxdInstanceStatus,
        )}
      >
        <strong className="status-count">{count}</strong>
      </Link>
    </div>
  );
};

export default InstancesOverviewStatus;
