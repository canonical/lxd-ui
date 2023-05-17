import React, { FC } from "react";
import { Icon, MainTable, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { fetchClusterMembers } from "api/cluster";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import Loader from "components/Loader";
import ClusterGroupSelector from "pages/cluster/ClusterGroupSelector";
import { useParams } from "react-router-dom";
import EditClusterGroupBtn from "pages/cluster/actions/EditClusterGroupBtn";
import EmptyState from "components/EmptyState";
import DeleteClusterGroupBtn from "pages/cluster/actions/DeleteClusterGroupBtn";
import ScrollableTable from "components/ScrollableTable";
import { usePagination } from "util/pagination";
import {
  allClusterGroups,
  getClusterHeaders,
  getClusterRows,
} from "util/clusterGroups";
import Pagination from "components/Pagination";
import { useSettings } from "context/useSettings";

const ClusterList: FC = () => {
  const notify = useNotify();
  const { group: activeGroup } = useParams<{ group: string }>();
  const { data: settings } = useSettings();
  const isClustered = settings?.environment?.server_clustered;

  const {
    data: members = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
    enabled: isClustered,
  });

  if (error) {
    notify.failure("Loading cluster members failed", error);
  }

  const filteredMembers = members.filter(
    (member) => !activeGroup || member.groups?.includes(activeGroup)
  );

  const headers = getClusterHeaders(activeGroup);
  const rows = getClusterRows(filteredMembers, activeGroup);
  const pagination = usePagination(rows);

  return (
    <main className="l-main cluster-list">
      <div className="p-panel">
        <div className="p-panel__header">
          <h1 className="p-panel__title">
            {isClustered ? (
              <ClusterGroupSelector
                activeGroup={activeGroup ?? allClusterGroups}
                key={activeGroup}
              />
            ) : (
              "Cluster"
            )}
          </h1>
          {activeGroup && (
            <div className="p-panel__controls">
              <EditClusterGroupBtn group={activeGroup} />
            </div>
          )}
        </div>
        <div className="p-panel__content cluster-content">
          <NotificationRow />
          <Row>
            <ScrollableTable
              dependencies={[filteredMembers, notify.notification]}
              belowId="pagination"
            >
              <MainTable
                headers={headers}
                rows={pagination.pageData}
                sortable
                onUpdateSort={pagination.updateSort}
                emptyStateMsg={
                  isLoading && isClustered ? (
                    <Loader text="Loading cluster members..." />
                  ) : activeGroup ? (
                    <EmptyState
                      iconClass=""
                      iconName="machines"
                      title="Cluster group empty"
                      message="Add cluster members to this group."
                    >
                      <p>
                        <a
                          className="p-link--external"
                          href="https://linuxcontainers.org/lxd/docs/latest/explanation/clustering/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Learn more about clustering
                          <Icon
                            className="external-link-icon"
                            name="external-link"
                          />
                        </a>
                      </p>
                      <DeleteClusterGroupBtn group={activeGroup} />
                    </EmptyState>
                  ) : (
                    <EmptyState
                      iconClass=""
                      iconName="machines"
                      title="This server is not clustered"
                      message="Creating cluster members is not supported in LXD UI. Create one using LXD CLI"
                    >
                      <p>
                        <a
                          className="p-link--external"
                          href="https://linuxcontainers.org/lxd/docs/latest/explanation/clustering/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Learn more about clustering
                          <Icon
                            className="external-link-icon"
                            name="external-link"
                          />
                        </a>
                      </p>
                    </EmptyState>
                  )
                }
              />
            </ScrollableTable>
            <Pagination
              {...pagination}
              id="pagination"
              totalCount={members.length}
              visibleCount={
                filteredMembers.length === members.length
                  ? pagination.pageData.length
                  : filteredMembers.length
              }
              keyword="cluster member"
            />
          </Row>
        </div>
      </div>
    </main>
  );
};

export default ClusterList;
