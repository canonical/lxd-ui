import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import Loader from "components/Loader";
import { useDocs } from "context/useDocs";
import ScrollableTable from "components/ScrollableTable";
import { fetchNetworkLeases } from "api/network-leases";
import ResourceLink from "components/ResourceLink";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkLeases: FC<Props> = ({ network, project }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const isClustered = useIsClustered();

  const {
    data: leases = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.leases,
    ],
    queryFn: async () => fetchNetworkLeases(network.name, project),
  });

  if (error) {
    notify.failure("Loading network leases failed", error);
  }

  const hasNetworkLeases = leases.length > 0;

  const headers = [
    { content: "Type", sortKey: "type" },
    { content: "Hostname", sortKey: "hostname" },
    { content: "IP Address", sortKey: "address" },
    { content: "Project", sortKey: "project" },
    ...(isClustered
      ? [{ content: "Cluster member", sortKey: "clusterMember" }]
      : []),
    { content: "MAC address", sortKey: "macAddress" },
  ];

  const rows = leases.map((lease) => {
    return {
      key: lease.address,
      columns: [
        {
          content: lease.type,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: lease.hostname,
          role: "rowheader",
          "aria-label": "Hostname",
        },
        {
          content: lease.address,
          role: "cell",
          "aria-label": "MAC address",
        },
        {
          content: lease.project && (
            <ResourceLink
              type="project"
              value={lease.project}
              to={`/ui/project/${encodeURIComponent(lease.project)}`}
            />
          ),
          role: "cell",
          "aria-label": "project",
        },
        ...(isClustered
          ? [
              {
                content: lease.location && (
                  <ResourceLink
                    type="cluster-member"
                    value={lease.location}
                    to="/ui/cluster"
                  />
                ),
                role: "cell",
                "aria-label": "Cluster member",
              },
            ]
          : []),
        {
          content: lease.hwaddr,
          role: "cell",
          "aria-label": "Description",
        },
      ],
      sortData: {
        hostname: lease.hostname.toLowerCase(),
        macAddress: lease.hwaddr,
        address: lease.address,
        type: lease.type,
        project: lease.project?.toLowerCase(),
        clusterMember: lease.location?.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  return (
    <Row>
      {hasNetworkLeases && (
        <ScrollableTable
          dependencies={leases}
          tableId="network-lease-table"
          belowIds={["status-bar"]}
        >
          <MainTable
            id="network-lease-table"
            headers={headers}
            expanding
            rows={rows}
            responsive
            sortable
            className="u-table-layout--auto"
            emptyStateMsg="No data to display"
          />
        </ScrollableTable>
      )}
      {!isLoading && !hasNetworkLeases && (
        <EmptyState
          className="empty-state"
          image={<Icon className="empty-state-icon" name="exposed" />}
          title="No network leases found"
        >
          <p>There are no network leases in this project.</p>
          <p>
            <a
              href={`${docBaseLink}/howto/network_ipam/#view-dhcp-leases-for-fully-controlled-networks`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about network leases
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
        </EmptyState>
      )}
    </Row>
  );
};

export default NetworkLeases;
