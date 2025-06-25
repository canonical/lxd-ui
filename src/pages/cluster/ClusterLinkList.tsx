import type { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  List,
  MainTable,
  Row,
  ScrollableTable,
  Spinner,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import CreateClusterLinkBtn from "pages/cluster/actions/CreateClusterLinkBtn";
import DeleteClusterLinkBtn from "pages/cluster/actions/DeleteClusterLinkBtn";
import { useIdentities } from "context/useIdentities";
import usePanelParams, { panels } from "util/usePanelParams";
import { capitalizeFirstLetter } from "util/helpers";
import ClusterLinkStatus from "pages/cluster/ClusterLinkStatus";
import EditClusterLinkBtn from "pages/cluster/actions/EditClusterLinksBtn";
import EditClusterLinkPanel from "pages/cluster/panels/EditClusterLinkPanel";
import { useClusterLinks } from "context/useClusterLinks";
import ClusterLinkAddresses from "pages/cluster/ClusterLinkAddresses";
import CreateClusterLink from "pages/cluster/CreateClusterLink";

const ClusterLinkList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: identities = [] } = useIdentities();
  const { data: clusterLinks = [], error, isLoading } = useClusterLinks();

  if (error) {
    notify.failure("Loading cluster links failed", error);
  }

  const getLinkIdentity = (name: string | null) => {
    return identities.find(
      (identity) =>
        identity.name === name &&
        identity.type.startsWith("Cluster link certificate"),
    );
  };

  const headers = [
    {
      content: "Name",
      sortKey: "name",
    },
    {
      content: "Status",
      className: "status-header",
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
    const identity = getLinkIdentity(clusterLink.name);
    const authGroupCount = identity?.groups?.length ?? 0;
    const openEditLinkPanel = () => {
      panelParams.openEditClusterLink(clusterLink.name);
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
          content: <ClusterLinkStatus identity={identity} link={clusterLink} />,
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
          content: <ClusterLinkAddresses clusterLink={clusterLink} />,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: (
            <Button appearance="link" dense onClick={openEditLinkPanel}>
              {authGroupCount}
            </Button>
          ),
          role: "cell",
          "aria-label": "Auth groups",
        },
        {
          content: (
            <List
              inline
              className="actions-list u-no-margin--bottom"
              items={[
                <EditClusterLinkBtn clusterLink={clusterLink} key="edit" />,
                <DeleteClusterLinkBtn clusterLink={clusterLink} key="delete" />,
              ]}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: clusterLink.name,
        description: clusterLink.description,
        type: clusterLink.type,
        groups: authGroupCount,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });
  const isEmptyState = clusterLinks.length === 0 && !isLoading;
  const panelIdentity = getLinkIdentity(panelParams.identity);

  return (
    <>
      <BaseLayout
        title={
          <HelpLink
            docPath="/explanation/clustering/"
            title="Learn more about clustering"
          >
            Cluster links
          </HelpLink>
        }
        controls={!isEmptyState && <CreateClusterLinkBtn />}
      >
        <NotificationRow />
        <Row>
          {!isEmptyState && (
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
                    className="cluster-link-table"
                    headers={headers}
                    sortable
                    onUpdateSort={updateSort}
                    emptyStateMsg={
                      isLoading && (
                        <Spinner
                          className="u-loader"
                          text="Loading cluster links..."
                        />
                      )
                    }
                  />
                </TablePagination>
              </ScrollableTable>
            </>
          )}
          {isEmptyState && (
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
      {panelParams.panel === panels.editClusterLink && panelIdentity && (
        <EditClusterLinkPanel identity={panelIdentity} />
      )}
    </>
  );
};

export default ClusterLinkList;
