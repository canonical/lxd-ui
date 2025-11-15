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
import { useDocs } from "context/useDocs";
import { fetchNetworkPeers } from "api/network-peering";
import ResourceLink from "components/ResourceLink";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkPeers: FC<Props> = ({ network, project }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();

  const {
    data: peers = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.peers,
    ],
    queryFn: async () => fetchNetworkPeers(network.name, project),
  });

  if (error) {
    notify.failure("Loading local network peers failed", error);
  }

  const hasNetworkPeers = peers.length > 0;

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Peer project", sortKey: "project" },
    { content: "Peer Network", sortKey: "peernetwork" },
    { content: "Status", sortKey: "status" },
  ];

  const rows = peers.map((peer) => {
    return {
      key: peer.name,
      columns: [
        {
          content: peer.name,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: peer.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: peer.project && (
            <ResourceLink
              type="project"
              value={peer.project}
              to={`/ui/project/${encodeURIComponent(peer.project)}`}
            />
          ),
          role: "cell",
          "aria-label": "Project",
        },
        {
          content: peer.target_network,
          role: "rowheader",
          "aria-label": "Target network",
        },
        {
          content: peer.status,
          role: "cell",
          "aria-label": "Status",
        },
      ],
      sortData: {
        hostname: peer.name.toLowerCase(),
        description: peer.description.toLowerCase(),
        project: peer.project?.toLowerCase(),
        peernetwork: peer.target_network,
        status: peer.status?.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <Row>
      {hasNetworkPeers && (
        <ScrollableTable
          dependencies={peers}
          tableId="network-peer-table"
          belowIds={["status-bar"]}
        >
          <MainTable
            id="network-peer-table"
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
      {!isLoading && !hasNetworkPeers && (
        <EmptyState
          className="empty-state"
          image={<Icon className="empty-state-icon" name="exposed" />}
          title="No local peerings found"
        >
          <p>There are no local peerings in this network and project.</p>
          <p>
            <a
              href={`${docBaseLink}/howto/network_ovn_peers`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about local peering
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
        </EmptyState>
      )}
    </Row>
  );
};

export default NetworkPeers;
