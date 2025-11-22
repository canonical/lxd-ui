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
import type { LxdNetwork } from "types/network";
import ResourceLink from "components/ResourceLink";
import DocLink from "components/DocLink";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateLocalPeeringPanel from "./panels/CreateLocalPeeringPanel";
import { useLocalPeerings } from "context/useLocalPeerings";
import CreateNetworkPeeringBtn from "./actions/CreateNetworkPeeringBtn";
import LocalPeeringActions from "./actions/LocalPeeringActions";
import EditLocalPeeringPanel from "./panels/EditLocalPeeringPanel";
import LocalPeeringStatusIcon from "./LocalPeeringStatusIcon";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkPeers: FC<Props> = ({ network, project }) => {
  const notify = useNotify();

  const {
    data: localPeerings = [],
    error,
    isLoading,
  } = useLocalPeerings(network, project);

  const panelParams = usePanelParams();
  const hasNetworkPeers = localPeerings.length > 0;

  if (error) {
    notify.failure("Loading local network peerings failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Target project", sortKey: "targetProject" },
    { content: "Target network", sortKey: "targetNetwork" },
    {
      content: <span className="status-header">Status</span>,
      sortKey: "status",
    },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = localPeerings.map((localPeering) => {
    return {
      key: localPeering.name,
      columns: [
        {
          content: localPeering.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: localPeering.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: localPeering.target_project ? (
            <ResourceLink
              type="project"
              value={localPeering.target_project}
              to={`/ui/project/${encodeURIComponent(localPeering.target_project)}`}
            />
          ) : (
            "-"
          ),
          role: "cell",
          "aria-label": "Target project",
        },
        {
          content: localPeering.target_network ? (
            <ResourceLink
              type="network"
              value={localPeering.target_network}
              to={`/ui/project/${encodeURIComponent(localPeering.target_project ?? "")}/network/${encodeURIComponent(localPeering.target_network)}`}
            />
          ) : (
            "-"
          ),
          role: "cell",
          "aria-label": "Target network",
        },
        {
          content: <LocalPeeringStatusIcon localPeering={localPeering} />,
          role: "cell",
          "aria-label": "Status",
        },
        {
          content: (
            <LocalPeeringActions
              network={network}
              localPeering={localPeering.name}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: localPeering.name?.toLowerCase(),
        description: localPeering.description?.toLowerCase(),
        targetProject: localPeering.target_project?.toLowerCase(),
        targetNetwork: localPeering.target_network,
        status: localPeering.status?.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <>
      {hasNetworkPeers && (
        <CreateNetworkPeeringBtn network={network} className=" u-float-right" />
      )}
      <Row>
        {hasNetworkPeers && (
          <ScrollableTable
            dependencies={localPeerings}
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
              className="network-peer-list u-table-layout--auto"
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
            <CreateNetworkPeeringBtn
              className="empty-state-button"
              network={network}
            />
          </EmptyState>
        )}
      </Row>

      {panelParams.panel === panels.createLocalPeering && (
        <CreateLocalPeeringPanel network={network} />
      )}
      {panelParams.panel === panels.editLocalPeering && (
        <EditLocalPeeringPanel network={network} />
      )}
    </>
  );
};

export default NetworkPeers;
