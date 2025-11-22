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
import { fetchNetworkPeers } from "api/network-peering";
import ResourceLink from "components/ResourceLink";
import DocLink from "components/DocLink";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkPeers: FC<Props> = ({ network, project }) => {
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
    notify.failure("Loading local network peerings failed", error);
  }

  const hasNetworkPeers = peers.length > 0;

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Peer project", sortKey: "project" },
    { content: "Peer network", sortKey: "peerNetwork" },
    { content: "Status", sortKey: "status" },
  ];

  const rows = peers.map((peer) => {
    return {
      key: peer.name,
      columns: [
        {
          content: peer.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: peer.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: peer.target_project && (
            <ResourceLink
              type="project"
              value={peer.target_project}
              to={`/ui/project/${encodeURIComponent(peer.target_project)}`}
            />
          ),
          role: "cell",
          "aria-label": "Project",
        },
        {
          content: (
            <ResourceLink
              type="network"
              value={peer.target_network}
              to={`/ui/project/${encodeURIComponent(peer.target_project ?? "")}/network/${encodeURIComponent(peer.target_network)}`}
            />
          ),
          role: "cell",
          "aria-label": "Target network",
        },
        {
          content: peer.status,
          role: "cell",
          "aria-label": "Status",
        },
      ],
      sortData: {
        name: peer.name?.toLowerCase(),
        description: peer.description?.toLowerCase(),
        project: peer.target_project?.toLowerCase(),
        peerNetwork: peer.target_network,
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
          />
        </ScrollableTable>
      )}
      {!hasNetworkPeers && (
        <EmptyState
          className="empty-state"
          image={<Icon className="empty-state-icon" name="exposed" />}
          title="No local peerings found"
        >
          <p>There are no local peerings in this network and project.</p>
          <p>
            <DocLink docPath={`/howto/network_ovn_peers`}>
              Learn more about local peering
            </DocLink>
          </p>
        </EmptyState>
      )}
    </Row>
  );
};

export default NetworkPeers;
