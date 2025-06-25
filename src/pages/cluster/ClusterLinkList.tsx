import type { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { fetchClusterLinks } from "api/cluster";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import CreateClusterLinkBtn from "pages/cluster/actions/CreateClusterLinkBtn";
import DeleteClusterLinksBtn from "pages/cluster/actions/DeleteClusterLinksBtn";
import CreateClusterLink from "pages/cluster/CreateClusterLink";
import { useIdentities } from "context/useIdentities";
import usePanelParams, { panels } from "util/usePanelParams";
import EditIdentityGroupsPanel from "pages/permissions/panels/EditIdentityGroupsPanel";
import { capitalizeFirstLetter } from "util/helpers";

const ClusterLinkList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: identities = [] } = useIdentities();

  const {
    data: clusterLinks = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.links],
    queryFn: fetchClusterLinks,
  });

  if (error) {
    notify.failure("Loading cluster links failed", error);
  }

  const headers = [
    {
      content: "Name",
      sortKey: "name",
    },
    {
      content: "Status",
      sortKey: "status",
    },
    {
      content: "Type",
      sortKey: "type",
    },
    {
      content: "Description",
      sortKey: "description",
    },
    {
      content: "Addresses",
    },
    {
      content: "Auth groups",
      sortKey: "groups",
    },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = clusterLinks.map((clusterLink) => {
    const clusterIdentity = identities.find((identity) => {
      return (
        identity.name === clusterLink.name &&
        identity.type.startsWith("Cluster link certificate")
      );
    });

    const groups = clusterIdentity?.groups?.length ?? 0;
    const status = clusterIdentity?.type.includes("(pending)")
      ? "Pending"
      : "Active";

    const openGroupPanelForIdentity = () => {
      panelParams.openIdentityGroups(clusterLink.name);
    };

    return {
      key: clusterLink.name,
      columns: [
        {
          content: clusterLink.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: status,
          role: "cell",
          "aria-label": "Status",
        },
        {
          content: capitalizeFirstLetter(clusterLink.type.toLowerCase()),
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: clusterLink.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: clusterLink.config["volatile.addresses"],
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: (
            <Button appearance="link" dense onClick={openGroupPanelForIdentity}>
              {groups}
            </Button>
          ),
          role: "cell",
          "aria-label": "Auth groups",
        },
        {
          content: <DeleteClusterLinksBtn clusterLink={clusterLink} />,
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: clusterLink.name,
        description: clusterLink.description,
        status: status,
        type: clusterLink.type,
        groups: groups,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  const panelIdentities = identities.filter(
    (id) =>
      id.type.startsWith("Cluster link certificate") &&
      id.name === panelParams.identity,
  );

  return (
    <>
      <BaseLayout
        title={
          <HelpLink
            href={`${docBaseLink}/explanation/clustering/`}
            title="Learn more about clustering"
          >
            Cluster links
          </HelpLink>
        }
        controls={clusterLinks.length > 0 && <CreateClusterLinkBtn />}
      >
        <NotificationRow />
        <Row>
          {clusterLinks.length > 0 && (
            <>
              <ScrollableTable
                dependencies={[clusterLinks, notify.notification]}
                tableId="cluster-link-table"
                belowIds={["status-bar"]}
              >
                <TablePagination
                  data={sortedRows}
                  id="pagination"
                  itemName="cluster link"
                  className="u-no-margin--top"
                  aria-label="Table pagination control"
                >
                  <MainTable
                    id="cluster-link-table"
                    headers={headers}
                    sortable
                    onUpdateSort={updateSort}
                    emptyStateMsg={
                      isLoading && <Loader text="Loading cluster links..." />
                    }
                  />
                </TablePagination>
              </ScrollableTable>
            </>
          )}
          {!isLoading && clusterLinks.length === 0 && (
            <EmptyState
              className="empty-state"
              image={<Icon name="applications" className="empty-state-icon" />}
              title="No cluster links found"
            >
              <p>There are no cluster links on this server.</p>
              <p>
                <a
                  href={`${docBaseLink}/explanation/clustering/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about clustering
                  <Icon className="external-link-icon" name="external-link" />
                </a>
              </p>
              <CreateClusterLinkBtn />
            </EmptyState>
          )}
        </Row>
      </BaseLayout>
      <CreateClusterLink />
      {panelParams.panel === panels.identityGroups &&
        panelIdentities.length > 0 && (
          <EditIdentityGroupsPanel
            identities={panelIdentities}
            onClose={() => {}}
          />
        )}
    </>
  );
};

export default ClusterLinkList;
