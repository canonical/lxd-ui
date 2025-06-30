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

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkLeases: FC<Props> = ({ network, project }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();

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
    { content: "Hostname", sortKey: "hostname" },
    { content: "MAC address", sortKey: "mac_address" },
    { content: "IP Address", sortKey: "address" },
    { content: "Type", sortKey: "type" },
  ];

  const rows = leases.map((lease) => {
    return {
      key: lease.address,
      columns: [
        {
          content: lease.hostname,
          role: "rowheader",
          "aria-label": "Listen address",
        },
        {
          content: lease.hwaddr,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: lease.address,
          role: "cell",
          "aria-label": "Default target address",
        },
        {
          content: lease.type,
          role: "cell",
          "aria-label": "Default target address",
        },
      ],
      sortData: {
        hostname: lease.hostname,
        mac_address: lease.hwaddr,
        address: lease.address,
        type: lease.type,
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
            paginate={30}
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
