import type { FC } from "react";
import type { LxdLoadBalancer, LxdLoadBalancerPort } from "types/loadBalancers";
import {
  useLoadBalancerPool,
  useLoadBalancerPoolState,
} from "context/useLoadBalancerPools";
import type { LxdNetwork } from "types/network";
import { Icon } from "@canonical/react-components";

interface Props {
  network: LxdNetwork;
  project: string;
  port: LxdLoadBalancerPort;
  loadBalancer: LxdLoadBalancer;
}

const LoadBalancerPortStatus: FC<Props> = ({
  network,
  project,
  port,
  loadBalancer,
}) => {
  const { data: pool } = useLoadBalancerPool(
    network.name,
    project,
    port.target_pool,
  );

  const { data: poolState } = useLoadBalancerPoolState(
    network.name,
    project,
    port.target_pool,
  );

  const portTargets = poolState?.targets?.filter((item) => {
    return (
      item.listen_address === loadBalancer.listen_address &&
      item.listen_port === port.listen_port
    );
  });

  let onlineCount = 0;
  let offlineCount = 0;
  let unknownCount = 0;

  portTargets?.forEach((target) => {
    if (target.status === "online") onlineCount++;
    else if (target.status === "offline") offlineCount++;
    else if (target.status === "unknown") unknownCount++;
  });

  const getStatus = () => {
    if (!pool || !portTargets || pool?.config.healthcheck === "false") {
      return "Unknown";
    }
    if (onlineCount > 0 && offlineCount + unknownCount > 0) {
      return "Degraded";
    }
    if (onlineCount > 0 && offlineCount + unknownCount === 0) {
      return "Online";
    }
    if (unknownCount > 0 && onlineCount + offlineCount === 0) {
      return "Unknown";
    }
    return "Offline";
  };

  const status = getStatus();

  const iconLookup = {
    Online: "status-succeeded-small",
    Offline: "status-failed-small",
    Degraded: "status-waiting-small",
    Unknown: "status-queued-small",
  };
  const icon = iconLookup[status];

  return (
    <>
      <Icon name={icon} className="status-icon" />
      {status}
    </>
  );
};

export default LoadBalancerPortStatus;
