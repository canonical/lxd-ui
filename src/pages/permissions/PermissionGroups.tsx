import {
  Button,
  EmptyState,
  Icon,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import type { FC } from "react";
import { useEffect, useState } from "react";
import useSortTableData from "util/useSortTableData";
import { getIdentityIdsForGroup } from "util/permissionIdentities";
import usePanelParams, { panels } from "util/usePanelParams";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import GroupActions from "./actions/GroupActions";
import CreateGroupPanel from "./panels/CreateGroupPanel";
import EditGroupPanel from "./panels/EditGroupPanel";
import PermissionGroupsFilter from "./PermissionGroupsFilter";
import EditGroupIdentitiesBtn from "./actions/EditGroupIdentitiesBtn";
import EditGroupIdentitiesPanel from "./panels/EditGroupIdentitiesPanel";
import BulkDeleteGroupsBtn from "./actions/BulkDeleteGroupsBtn";
import { useAuthGroups } from "context/useAuthGroups";
import { useServerEntitlements } from "util/entitlements/server";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import DocLink from "components/DocLink";

const PermissionGroups: FC = () => {
  const notify = useNotify();
  const { data: groups = [], error, isLoading } = useAuthGroups();
  const panelParams = usePanelParams();
  const [search, setSearch] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const { canCreateGroups } = useServerEntitlements();
  const isSmallScreen = useIsScreenBelow();

  if (error) {
    notify.failure("Loading groups failed", error);
  }

  useEffect(() => {
    const validSelections = selectedGroupNames.filter((name) =>
      groups.some((group) => group.name === name),
    );
    if (validSelections.length !== selectedGroupNames.length) {
      setSelectedGroupNames(validSelections);
    }
  }, [groups]);

  useEffect(() => {
    if (panelParams.group) {
      setSelectedGroupNames([panelParams.group]);
    }
  }, [panelParams.group, groups]);

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

  const panelGroup = groups.find((group) => group.name === panelParams.group);

  const rows = filteredGroups.map((group) => {
    const allIdentityIds = getIdentityIdsForGroup(group);
    return {
      key: group.name,
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          role: "rowheader",
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
          content: (
            <Button
              appearance="link"
              dense
              onClick={() => {
                panelParams.openEditGroup(group.name, "identity");
              }}
            >
              {allIdentityIds.length}
            </Button>
          ),
          role: "cell",
          className: "u-align--right identities",
          "aria-label": "Identities in this group",
        },
        {
          content: (
            <Button
              appearance="link"
              dense
              onClick={() => {
                panelParams.openEditGroup(group.name, "permission");
              }}
            >
              {group.permissions?.length || 0}
            </Button>
          ),
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
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
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
    } else {
      return null;
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
          disabledNames={[]}
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
        <DocLink docPath="/explanation/authorization" hasExternalIcon>
          Learn more about permissions
        </DocLink>
      </p>
      <Button
        className="empty-state-button"
        appearance="positive"
        onClick={() => {
          panelParams.openCreateGroup();
        }}
        disabled={!canCreateGroups()}
        title={
          canCreateGroups() ? "" : "You do not have permission to create groups"
        }
        hasIcon={!isSmallScreen}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>Create group</span>
      </Button>
    </EmptyState>
  );

  return (
    <>
      <CustomLayout
        mainClassName="permission-groups-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/explanation/authorization"
                  title="Learn more about permissions"
                >
                  Auth groups
                </HelpLink>
              </PageHeader.Title>
              {!selectedGroupNames.length && hasGroups && (
                <PageHeader.Search>
                  <PermissionGroupsFilter
                    onChange={setSearch}
                    value={search}
                    disabled={!!panelParams.group}
                    className="u-no-margin--bottom"
                  />
                </PageHeader.Search>
              )}
              {selectedGroupNames.length > 0 && !panelParams.panel && (
                <>
                  <EditGroupIdentitiesBtn
                    groups={selectedGroups}
                    className="u-no-margin--bottom"
                  />
                  <BulkDeleteGroupsBtn
                    groups={selectedGroups}
                    className="u-no-margin--bottom"
                    onDelete={() => {
                      setSelectedGroupNames([]);
                    }}
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
                    onClick={() => {
                      panelParams.openCreateGroup();
                    }}
                    disabled={!canCreateGroups()}
                    title={
                      canCreateGroups()
                        ? ""
                        : "You do not have permission to create groups"
                    }
                    hasIcon={!isSmallScreen}
                  >
                    {!isSmallScreen && <Icon name="plus" light />}
                    <span>Create group</span>
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

      {panelParams.panel === panels.editGroup && panelGroup && (
        <EditGroupPanel
          group={panelGroup}
          onClose={() => {
            setSelectedGroupNames([]);
          }}
        />
      )}

      {panelParams.panel === panels.groupIdentities &&
        !!selectedGroups.length && (
          <EditGroupIdentitiesPanel groups={selectedGroups} />
        )}
    </>
  );
};

export default PermissionGroups;
