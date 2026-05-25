import type { FC } from "react";
import type { LxdLoadBalancerPool } from "types/loadBalancers";
import { Chip, Icon, Tooltip } from "@canonical/react-components";
import { getHealthCheckType } from "util/loadBalancers";

interface Props {
  pool: LxdLoadBalancerPool;
}

const LoadBalancerPoolHealthCheck: FC<Props> = ({ pool }) => {
  const healthType = getHealthCheckType(pool);

  return (
    <>
      {healthType}
      {healthType !== "disabled" && (
        <>
          {" "}
          <Tooltip
            position="right"
            message={
              <>
                <Chip
                  lead="Interval"
                  value={`${pool.config["healthcheck.interval"] ?? 5}s`}
                  isDense
                  isReadOnly
                  className="u-no-margin--bottom"
                />
                <br />
                <Chip
                  lead="Timeout"
                  value={`${pool.config["healthcheck.timeout"] ?? 5}s`}
                  isDense
                  isReadOnly
                  className="u-no-margin--bottom"
                />
                <br />
                <Chip
                  lead="Success count"
                  value={`${pool.config["healthcheck.success_count"] ?? 1}`}
                  isDense
                  isReadOnly
                  className="u-no-margin--bottom"
                />
                <br />
                <Chip
                  lead="Failure count"
                  value={`${pool.config["healthcheck.failure_count"] ?? 1}`}
                  isDense
                  isReadOnly
                  className="u-no-margin--bottom"
                />
              </>
            }
          >
            <Icon name="information" />
          </Tooltip>
        </>
      )}
    </>
  );
};

export default LoadBalancerPoolHealthCheck;
