import {
  Button,
  EmptyState,
  Icon,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { FC, useEffect, useState } from "react";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import { getIdentityIdsForGroup } from "util/permissionIdentities";
import usePanelParams, { panels } from "util/usePanelParams";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import { fetchGroups } from "api/auth-groups";
import GroupActions from "./actions/GroupActions";
import CreateGroupPanel from "./panels/CreateGroupPanel";
import EditGroupPanel from "./panels/EditGroupPanel";
import PermissionGroupsFilter from "./PermissionGroupsFilter";
import EditGroupIdentitiesBtn from "./actions/EditGroupIdentitiesBtn";
import EditGroupIdentitiesPanel from "./panels/EditGroupIdentitiesPanel";
import BulkDeleteGroupsBtn from "./actions/BulkDeleteGroupsBtn";
import EditGroupPermissionsPanel from "./panels/EditGroupPermissionsPanel";

const PermissionGroups: FC = () => {
  const notify = useNotify();
  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.authGroups],
    queryFn: fetchGroups,
  });
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [search, setSearch] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);

  if (error) {
    notify.failure("Loading groups failed", error);
  }

  useEffect(() => {
    if (panelParams.group) {
      setSelectedGroupNames([panelParams.group]);
    }
  }, [panelParams.group]);

  const headers = [
    { content: "Name", className: "name", sortKey: "name" },
    {
      content: "Description",
      className: "description",
      sortKey: "description",
    },
    {
      content: "Identities",
      sortKey: "identities",
      className: "u-align--right identities",
    },
    {
      content: "Permissions",
      sortKey: "permissions",
      className: "u-align--right permissions",
    },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const filteredGroups = groups.filter(
    (group) =>
      !search ||
      group.name.toLowerCase().includes(search) ||
      group.description.toLowerCase().includes(search),
  );

  const selectedGroups = groups.filter((group) =>
    selectedGroupNames.includes(group.name),
  );

  const rows = filteredGroups.map((group) => {
    const allIdentityIds = getIdentityIdsForGroup(group);
    return {
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          role: "cell",
          "aria-label": "Name",
          className: "u-truncate name",
          title: group.name,
        },
        {
          content: <span>{group.description}</span>,
          role: "cell",
          "aria-label": "Description",
          className: "description",
          title: group.description,
        },
        {
          content: allIdentityIds.length,
          role: "cell",
          className: "u-align--right identities",
          "aria-label": "Identities in this group",
        },
        {
          content: group.permissions?.length || 0,
          role: "cell",
          className: "u-align--right permissions",
          "aria-label": "Permissions for this group",
        },
        {
          className: "actions u-align--right",
          content: <GroupActions group={group} />,
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: group.name.toLowerCase(),
        description: group.description.toLowerCase(),
        permissions: group.permissions?.length || 0,
        identities: allIdentityIds.length,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  if (isLoading) {
    return <Loader text="Loading groups" />;
  }

  const getTablePaginationDescription = () => {
    if (selectedGroupNames.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={groups.length ?? 0}
          itemName="group"
          parentName=""
          selectedNames={selectedGroupNames}
          setSelectedNames={setSelectedGroupNames}
          filteredNames={filteredGroups.map((item) => item.name)}
          hideActions={!!panelParams.panel}
        />
      );
    }
  };

  const hasGroups = groups.length > 0;
  const content = hasGroups ? (
    <ScrollableTable
      dependencies={[groups]}
      tableId="groups-table"
      belowIds={["status-bar"]}
    >
      <TablePagination
        data={sortedRows}
        id="pagination"
        itemName="group"
        className="u-no-margin--top"
        aria-label="Table pagination control"
        description={getTablePaginationDescription()}
      >
        <SelectableMainTable
          id="groups-table"
          className="groups-table"
          headers={headers}
          rows={sortedRows}
          sortable
          emptyStateMsg="No groups found matching this search"
          onUpdateSort={updateSort}
          itemName="group"
          parentName=""
          selectedNames={selectedGroupNames}
          setSelectedNames={setSelectedGroupNames}
          processingNames={[]}
          filteredNames={filteredGroups.map((item) => item.name)}
          disableSelect={!!panelParams.panel}
        />
      </TablePagination>
    </ScrollableTable>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="user-group" className="empty-state-icon" />}
      title="No groups"
    >
      <p>
        Groups are an easy way to manage the structured assignment of
        permissions
      </p>
      <p>
        <a
          href={`${docBaseLink}/explanation/authorization`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about permissions
          <Icon className="external-link-icon" name="external-link" />
        </a>
      </p>
      <Button
        className="empty-state-button"
        appearance="positive"
        onClick={panelParams.openCreateGroup}
      >
        Create group
      </Button>
    </EmptyState>
  );

  return (
    <>
      <CustomLayout
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  href={`${docBaseLink}/explanation/authorization`}
                  title="Learn more about permissions"
                >
                  Groups
                </HelpLink>
              </PageHeader.Title>
              {!selectedGroupNames.length && hasGroups && (
                <PageHeader.Search>
                  <PermissionGroupsFilter
                    onChange={setSearch}
                    value={search}
                    disabled={!!panelParams.group}
                  />
                </PageHeader.Search>
              )}
              {selectedGroupNames.length > 0 && !panelParams.panel && (
                <>
                  <BulkDeleteGroupsBtn
                    groups={selectedGroups}
                    className="u-no-margin--bottom"
                    onDelete={() => setSelectedGroupNames([])}
                  />
                  <EditGroupIdentitiesBtn
                    groups={selectedGroups}
                    className="u-no-margin--bottom"
                  />
                </>
              )}
            </PageHeader.Left>
            {hasGroups && (
              <PageHeader.BaseActions>
                {!selectedGroupNames.length && (
                  <Button
                    appearance="positive"
                    className="u-no-margin--bottom u-float-right"
                    onClick={panelParams.openCreateGroup}
                  >
                    Create group
                  </Button>
                )}
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row className="permission-groups">{content}</Row>
      </CustomLayout>

      {panelParams.panel === panels.createGroup && <CreateGroupPanel />}

      {panelParams.panel === panels.editGroup && !!selectedGroups.length && (
        <EditGroupPanel group={selectedGroups[0]} />
      )}

      {panelParams.panel === panels.groupIdentities &&
        !!selectedGroups.length && (
          <EditGroupIdentitiesPanel groups={selectedGroups} />
        )}

      {panelParams.panel === panels.groupPermissions &&
        !!selectedGroups.length && (
          <EditGroupPermissionsPanel group={selectedGroups[0]} />
        )}
    </>
  );
};

export default PermissionGroups;
