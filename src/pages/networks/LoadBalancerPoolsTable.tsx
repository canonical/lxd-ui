import type { FC } from "react";
import { MainTable } from "@canonical/react-components";
import type { LxdLoadBalancerPool } from "types/loadBalancers";
import DeleteLoadBalancerPoolBtn from "pages/networks/actions/DeleteLoadBalancerPoolBtn";
import type { LxdNetwork } from "types/network";
import EditLoadBalancerPoolBtn from "pages/networks/actions/EditLoadBalancerPoolBtn";
import LoadBalancerPoolInstances from "pages/networks/LoadBalancerPoolInstances";
import LoadBalancerPoolHealthCheck from "pages/networks/LoadBalancerPoolHealthCheck";
import LoadBalancerPoolStatuses from "pages/networks/LoadBalancerPoolInstanceStatuses";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  loadBalancerPools: LxdLoadBalancerPool[];
  network: LxdNetwork;
}

const LoadBalancerPoolsTable: FC<Props> = ({ loadBalancerPools, network }) => {
  const { hasLoadBalancerHealthChecks } = useSupportedFeatures();

  const headers = [
    { content: "Name", sortKey: "name", className: "name" },
    {
      content: "Target port",
      sortKey: "targetPort",
      className: "u-align--right target-port",
    },
    {
      content: "Used by",
      sortKey: "usedBy",
      className: "u-align--right used-by",
    },
    ...(hasLoadBalancerHealthChecks
      ? [{ content: "Health check", className: "health-check" }]
      : []),
    { content: "Instances" },
    { content: "Instance statuses", className: "status-header" },
    {
      "aria-label": "Actions",
      className: "u-align--right actions",
    },
  ];

  const rows = loadBalancerPools.map((pool) => {
    const usedBy = pool.used_by?.length ?? 0;

    return {
      key: pool.name,
      className: "u-row",
      columns: [
        {
          content: (
            <>
              {pool.name}
              {pool.description && (
                <div className="u-text--muted">{pool.description}</div>
              )}
            </>
          ),
          role: "cell",
          "aria-label": "Name",
          className: "name",
        },
        {
          content: (
            <>
              {pool.config.target_port}/{pool.config.protocol}
            </>
          ),
          role: "cell",
          "aria-label": "Target port",
          className: "u-align--right target-port",
        },
        {
          content: usedBy,
          role: "cell",
          "aria-label": "Used by",
          className: "u-align--right used-by",
        },
        ...(hasLoadBalancerHealthChecks
          ? [
              {
                content: <LoadBalancerPoolHealthCheck pool={pool} />,
                role: "cell",
                "aria-label": "Health check",
                className: "health-check",
              },
            ]
          : []),
        {
          content: <LoadBalancerPoolInstances pool={pool} />,
          role: "cell",
          "aria-label": "Instances",
        },
        {
          content: <LoadBalancerPoolStatuses pool={pool} network={network} />,
          role: "cell",
          "aria-label": "Statuses",
        },
        {
          content: (
            <>
              <EditLoadBalancerPoolBtn
                network={network}
                pool={pool.name}
                hasCaption={false}
              />
              <DeleteLoadBalancerPoolBtn
                network={network}
                pool={pool}
                hasCaption={false}
              />
            </>
          ),
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: pool.name,
        targetPort: pool.config.target_port,
        usedBy: usedBy,
      },
    };
  });

  return (
    <MainTable
      id="load-balancer-pools-table"
      headers={headers}
      responsive
      rows={rows}
      paginate={30}
      sortable
      defaultSort="name"
      defaultSortDirection="ascending"
      className="u-table-layout--auto load-balancer-pools-table"
      emptyStateMsg="No data to display"
    />
  );
};

export default LoadBalancerPoolsTable;
