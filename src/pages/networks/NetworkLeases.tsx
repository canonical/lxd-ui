import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import { fetchNetworkLeases } from "api/network-leases";
import ResourceLink from "components/ResourceLink";
import { useIsClustered } from "context/useIsClustered";
import DocLink from "components/DocLink";
import { typesWithNicStaticIPSupport } from "util/networks";
import { InstanceIpEdit } from "components/InstanceIpEdit";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkLeases: FC<Props> = ({ network, project }) => {
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
    { content: "Type", sortKey: "type", className: "type" },
    { content: "Hostname", sortKey: "hostname", className: "hostname" },
    { content: "Project", sortKey: "project", className: "project" },
    ...(isClustered
      ? [
          {
            content: "Cluster member",
            sortKey: "clusterMember",
            className: "clusterMember",
          },
        ]
      : []),
    { content: "MAC address", sortKey: "macAddress", className: "macAddress" },
    { content: "IP Address", sortKey: "address", className: "ipAddress" },
  ];

  const rows = leases.map((lease) => {
    return {
      key: lease.address + lease.hostname + lease.type,
      columns: [
        {
          content: lease.type,
          role: "cell",
          "aria-label": "Type",
          className: "type",
        },
        {
          content: lease.hostname,
          role: "rowheader",
          "aria-label": "Hostname",
          className: "hostname",
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
          className: "project",
        },
        ...(isClustered
          ? [
              {
                content: lease.location && (
                  <ResourceLink
                    type="cluster-member"
                    value={lease.location}
                    to={`/ui/cluster/member/${encodeURIComponent(lease.location)}`}
                  />
                ),
                role: "cell",
                "aria-label": "Cluster member",
                className: "clusterMember",
              },
            ]
          : []),
        {
          content: lease.hwaddr,
          role: "cell",
          "aria-label": "MAC address",
          className: "macAddress",
        },
        {
          content:
            typesWithNicStaticIPSupport.includes(network.type) &&
            ["static", "dynamic"].includes(lease.type) ? (
              <InstanceIpEdit
                address={lease.address}
                instanceName={lease.hostname}
                projectName={lease.project}
              />
            ) : (
              <>{lease.address}</>
            ),
          role: "cell",
          "aria-label": "IP address",
          className: "ipAddress",
        },
      ],
      sortData: {
        hostname: lease.hostname.toLowerCase(),
        macAddress: lease.hwaddr,
        type: lease.type,
        project: lease.project?.toLowerCase(),
        clusterMember: lease.location?.toLowerCase(),
        address: lease.address,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
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
            defaultSort="address"
            defaultSortDirection="ascending"
            className="network-leases-table"
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
            <DocLink
              docPath="/howto/network_ipam/#view-dhcp-leases-for-fully-controlled-networks"
              hasExternalIcon
            >
              Learn more about network leases
            </DocLink>
          </p>
        </EmptyState>
      )}
    </Row>
  );
};

export default NetworkLeases;
