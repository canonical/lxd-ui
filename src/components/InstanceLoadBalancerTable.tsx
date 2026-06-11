import type { FC } from "react";
import { MainTable } from "@canonical/react-components";
import type { LxdNicDevice } from "types/device";
import type { LxdInstance } from "types/instance";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";
import LoadBalancerPoolChip from "pages/networks/LoadBalancerPoolChip";
import InstanceLoadBalancerPoolStatus from "pages/instances/InstanceLoadBalancerPoolStatus";

interface Props {
  device: LxdNicDevice;
  instance: LxdInstance;
}

const InstanceLoadBalancerTable: FC<Props> = ({ device, instance }) => {
  const { data: pools = [] } = useLoadBalancerPools(
    device.network,
    instance.project,
  );

  const poolsReferencingInstance = pools.filter((pool) =>
    pool.instances.some((item) => item.name === instance.name),
  );

  if (poolsReferencingInstance.length === 0) {
    return null;
  }

  const headers = [
    {
      content: "Load balancer pools",
      className: "u-text--muted u-no-padding--bottom pools-header",
    },
    {
      content: "Status",
      className: "u-text--muted u-no-padding--bottom status-header",
    },
  ];

  const rows = [
    {
      key: device.network,
      columns: [
        {
          content: poolsReferencingInstance.map((item) => {
            return (
              <div key={item.name}>
                <LoadBalancerPoolChip
                  name={item.name}
                  network={device.network}
                  project={instance.project}
                />
              </div>
            );
          }),
          role: "cell",
          "aria-label": "Load balancer pool",
        },
        {
          content: poolsReferencingInstance.map((item) => {
            return (
              <div key={item.name}>
                <InstanceLoadBalancerPoolStatus
                  pool={item}
                  network={device.network}
                  instance={instance}
                />
              </div>
            );
          }),
          role: "cell",
          "aria-label": "Instance status in pool",
        },
      ],
    },
  ];

  return <MainTable headers={headers} rows={rows} />;
};

export default InstanceLoadBalancerTable;
