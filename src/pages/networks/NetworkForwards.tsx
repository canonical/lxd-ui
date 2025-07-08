import type { FC } from "react";
import {
  Button,
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
import { fetchNetworkForwards } from "api/network-forwards";
import { useDocs } from "context/useDocs";
import DeleteNetworkForwardBtn from "pages/networks/actions/DeleteNetworkForwardBtn";
import { Link } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import NetworkForwardPort from "pages/networks/NetworkForwardPort";
import ScrollableTable from "components/ScrollableTable";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { useIsClustered } from "context/useIsClustered";
import ResourceLink from "components/ResourceLink";
import { bridgeType } from "util/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkForwards: FC<Props> = ({ network, project }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { canEditNetwork } = useNetworkEntitlements();
  const isClustered = useIsClustered();
  const isClusterMemberSpecific = isClustered && network?.type === bridgeType;

  const {
    data: forwards = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.forwards,
    ],
    queryFn: async () => fetchNetworkForwards(network.name, project),
  });

  if (error) {
    notify.failure("Loading network forwards failed", error);
  }

  const hasNetworkForwards = forwards.length > 0;

  const headers = [
    { content: "Listen address", sortKey: "listenAddress" },
    { content: "Description", sortKey: "description" },
    {
      content: "Default target address",
      sortKey: "defaultTarget",
    },
    { content: "Ports" },
    ...(isClusterMemberSpecific
      ? [
          {
            content: "Location",
            sortKey: "location",
          },
        ]
      : []),
    {
      "aria-label": "Actions",
      className: "u-align--right actions",
    },
  ];

  const rows = forwards.map((forward) => {
    return {
      key: forward.listen_address,
      columns: [
        {
          content: forward.listen_address,
          role: "rowheader",
          "aria-label": "Listen address",
        },
        {
          content: forward.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: forward.config.target_address,
          role: "cell",
          "aria-label": "Default target address",
        },
        {
          content: (
            <ExpandableList
              items={forward.ports.map((port) => (
                <NetworkForwardPort key={port.listen_port} port={port} />
              ))}
            />
          ),
          role: "cell",
          "aria-label": "Forwarded ports",
        },
        ...(isClusterMemberSpecific
          ? [
              {
                content: (
                  <ResourceLink
                    type="cluster-member"
                    value={forward.location ?? ""}
                    to={`/ui/cluster`}
                  />
                ),
                role: "cell",
              },
            ]
          : []),
        {
          content: (
            <>
              {canEditNetwork(network) && (
                <Link
                  className="p-button--base u-no-margin--bottom has-icon"
                  to={
                    isClusterMemberSpecific
                      ? `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/member/${encodeURIComponent(forward.location ?? "")}/forwards/${encodeURIComponent(forward.listen_address)}/edit`
                      : `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/forwards/${encodeURIComponent(forward.listen_address)}/edit`
                  }
                  title="Edit network forward"
                >
                  <Icon name="edit" />
                </Link>
              )}
              {!canEditNetwork(network) && (
                <Button
                  key="edit"
                  appearance="base"
                  className="u-no-margin--bottom"
                  dense
                  hasIcon
                  type="button"
                  title="You do not have permission to edit forwards for this network"
                  disabled
                >
                  <Icon name="edit" />
                </Button>
              )}
              <DeleteNetworkForwardBtn
                key={forward.listen_address + forward.location}
                network={network}
                forward={forward}
                project={project}
              />
            </>
          ),
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        listenAddress: forward.listen_address,
        description: forward.description,
        defaultTarget: forward.config.target_address ?? "",
        location: forward.location,
      },
    };
  });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  return (
    <>
      {canEditNetwork(network) && (
        <Link
          className="p-button--positive u-no-margin--bottom u-float-right"
          to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/forwards/create`}
        >
          Create forward
        </Link>
      )}
      {!canEditNetwork(network) && (
        <Button
          appearance="positive"
          className="u-float-right u-no-margin--bottom"
          disabled
          title="You do not have permission to create network forwards for this network"
        >
          <span>Create forward</span>
        </Button>
      )}
      <Row>
        {hasNetworkForwards && (
          <ScrollableTable
            dependencies={forwards}
            tableId="network-forwards-table"
            belowIds={["status-bar"]}
          >
            <MainTable
              id="network-forwards-table"
              headers={headers}
              expanding
              rows={rows}
              paginate={30}
              sortable
              defaultSort="listenAddress"
              defaultSortDirection="ascending"
              className="u-table-layout--auto network-forwards-table"
              emptyStateMsg="No data to display"
            />
          </ScrollableTable>
        )}
        {!isLoading && !hasNetworkForwards && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="No network forwards found"
          >
            <p>There are no network forwards in this project.</p>
            <p>
              <a
                href={`${docBaseLink}/howto/network_forwards/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about network forwards
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </>
  );
};

export default NetworkForwards;
