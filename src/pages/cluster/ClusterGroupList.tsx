import type { FC } from "react";
import {
  List,
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { fetchClusterGroups } from "api/cluster";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import EditClusterGroupBtn from "pages/cluster/actions/EditClusterGroupBtn";
import DeleteClusterGroupBtn from "pages/cluster/actions/DeleteClusterGroupBtn";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import usePanelParams, { panels } from "util/usePanelParams";
import EditClusterGroupPanel from "pages/cluster/panels/EditClusterGroupPanel";
import CreateClusterGroupBtn from "pages/cluster/actions/CreateClusterGroupBtn";
import CreateClusterGroupPanel from "pages/cluster/panels/CreateClusterGroupPanel";
import ResourceLink from "components/ResourceLink";

const ClusterGroupList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const panelParams = usePanelParams();

  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups],
    queryFn: fetchClusterGroups,
  });

  if (error) {
    notify.failure("Loading cluster groups failed", error);
  }

  const headers = [
    {
      content: "Cluster group",
      className: "name",
      sortKey: "name",
    },
    {
      content: "Description",
      className: "description",
      sortKey: "description",
    },
    {
      content: "Members",
      className: "members",
    },
    {
      "aria-label": "Actions",
      className: "u-align--right actions",
    },
  ];

  const rows = groups.map((group) => {
    return {
      key: group.name,
      name: group.name,
      columns: [
        {
          content: group.name,
          className: "name",
        },
        {
          content: group.description || "-",
          className: "description",
        },
        {
          content: group.members.map((member) => (
            <ResourceLink
              type="cluster-member"
              value={member}
              to={`/ui/cluster/member/${encodeURIComponent(member)}/`}
              key={member}
            />
          )),
          className: "members",
        },
        {
          content: (
            <List
              inline
              className="actions-list u-no-margin--bottom"
              items={[
                <EditClusterGroupBtn group={group.name} key="edit" />,
                <DeleteClusterGroupBtn group={group.name} key="delete" />,
              ]}
            />
          ),
          className: "u-align--right actions",
        },
      ],
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <>
      <BaseLayout
        mainClassName="cluster-list"
        contentClassName="cluster-content"
        title={
          <HelpLink
            href={`${docBaseLink}/explanation/clustering/`}
            title="Learn more about clustering"
          >
            Cluster groups
          </HelpLink>
        }
        controls={<CreateClusterGroupBtn />}
      >
        <NotificationRow />
        <Row>
          <ScrollableTable
            dependencies={[groups, notify.notification]}
            tableId="cluster-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="cluster group"
              className="u-no-margin--top"
              aria-label="Table pagination control"
            >
              <MainTable
                id="cluster-table"
                headers={headers}
                sortable
                onUpdateSort={updateSort}
                emptyStateMsg={
                  isLoading && <Loader text="Loading cluster groups..." />
                }
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </BaseLayout>
      {panelParams.panel === panels.editClusterGroups && (
        <EditClusterGroupPanel />
      )}
      {panelParams.panel === panels.createClusterGroup && (
        <CreateClusterGroupPanel />
      )}
    </>
  );
};

export default ClusterGroupList;
