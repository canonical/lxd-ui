import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchPermissionGroups } from "api/permissions";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { useDocs } from "context/useDocs";
import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import CreatePermissionGroupBtn from "./CreatePermissionGroupBtn";
import PermissionGroupActions from "./PermissionGroupActions";
import classnames from "classnames";
import { getIdentitiesForGroup } from "util/permissions";

interface Props {
  query: string;
  selectedNames: string[];
  onSelectNames: (names: string[]) => void;
}

const PermissionGroups: FC<Props> = ({
  query,
  selectedNames,
  onSelectNames,
}) => {
  const notify = useNotify();
  const docBaseLink = useDocs();

  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.permissionGroups],
    queryFn: () => fetchPermissionGroups(),
  });

  if (error) {
    notify.failure("Loading permission groups failed", error);
  }

  useEffect(() => {
    const validNames = new Set(groups?.map((group) => group.name));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      onSelectNames(validSelections);
    }
  }, [groups]);

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", className: "description" },
    {
      content: "Permissions",
      sortKey: "permissions",
      className: "u-align--right",
    },
    {
      content: "Identities",
      sortKey: "identities",
      className: "u-align--right",
    },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const filteredGroups = groups.filter(
    (item) =>
      !query ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  );

  const rows = filteredGroups.map((group) => {
    const { totalIdentities } = getIdentitiesForGroup(group);
    return {
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              className="u-truncate"
              title={`name: ${group.name}`}
              to={`/ui/permissions/lxd-group/${group.name}`}
            >
              {group.name}
            </Link>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: (
            <span className="u-truncate" title={`name: ${group.description}`}>
              {group.description}
            </span>
          ),
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: group.permissions?.length || 0,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Permissions for this group",
        },
        {
          content: totalIdentities,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Identities in this group",
        },
        {
          className: "actions u-align--right",
          content: (
            <PermissionGroupActions
              group={group}
              className={classnames(
                "permission-group-actions",
                "u-no-margin--bottom",
              )}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: group.name,
        description: group.description,
        permissions: group.permissions?.length || 0,
        identities: totalIdentities,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader text="Loading groups" />;
  }

  return groups.length > 0 ? (
    <Row className="permissions">
      <div className="upper-controls-bar">
        <CreatePermissionGroupBtn groupType="lxd-groups" />
      </div>
      <ScrollableTable
        dependencies={[groups]}
        tableId="permission-groups-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="group"
          className="u-no-margin--top"
          aria-label="Table pagination control"
          description={
            selectedNames.length > 0 && (
              <SelectedTableNotification
                totalCount={groups.length ?? 0}
                itemName="group"
                parentName="system"
                selectedNames={selectedNames}
                setSelectedNames={onSelectNames}
                filteredNames={filteredGroups.map((item) => item.name)}
              />
            )
          }
        >
          <MainTable
            id="permission-groups-table"
            headers={headers}
            sortable
            className="permission-groups-table"
            emptyStateMsg="No groups found matching this search"
            onUpdateSort={updateSort}
          />
        </TablePagination>
      </ScrollableTable>
    </Row>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="lock-locked" className="empty-state-icon" />}
      title="No groups found in this system"
    >
      <p>Permission groups will appear here.</p>
      <p>
        <a
          // TODO: get actual doc path
          href={`${docBaseLink}/explanation/permissions/`}
          target="_blank"
          rel="noreferrer"
        >
          Learn more about permissions
          <Icon className="external-link-icon" name="external-link" />
        </a>
      </p>
      <CreatePermissionGroupBtn
        groupType="lxd-groups"
        className="empty-state-button"
      />
    </EmptyState>
  );
};

export default PermissionGroups;
