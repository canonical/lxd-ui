import {
  Button,
  Card,
  EmptyState,
  Icon,
  List,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import type { FC } from "react";
import { useEffect, useState } from "react";
import useSortTableData from "util/useSortTableData";
import usePanelParams, { panels } from "util/usePanelParams";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import PermissionGroupsFilter from "./PermissionGroupsFilter";
import CreateIdpGroupPanel from "./panels/CreateIdpGroupPanel";
import BulkDeleteIdpGroupsBtn from "./actions/BulkDeleteIdpGroupsBtn";
import EditIdpGroupPanel from "./panels/EditIdpGroupPanel";
import DeleteIdpGroupBtn from "./actions/DeleteIdpGroupBtn";
import { useSettings } from "context/useSettings";
import { Link } from "react-router-dom";
import { useIdpGroups } from "context/useIdpGroups";
import { useServerEntitlements } from "util/entitlements/server";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";
import { pluralize } from "util/instanceBulkActions";
import { useIsScreenBelow } from "context/useIsScreenBelow";

const PermissionIdpGroups: FC = () => {
  const notify = useNotify();
  const { data: groups = [], error, isLoading } = useIdpGroups();
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [search, setSearch] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const { data: settings } = useSettings();
  const hasCustomClaim = settings?.config?.["oidc.groups.claim"];
  const { canCreateIdpGroups } = useServerEntitlements();
  const { canEditIdpGroup } = useIdpGroupEntitlements();
  const isSmallScreen = useIsScreenBelow();

  if (error) {
    notify.failure("Loading provider groups failed", error);
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
    if (panelParams.idpGroup) {
      setSelectedGroupNames([panelParams.idpGroup]);
    }
  }, [panelParams.idpGroup, groups]);

  const headers = [
    { content: "Name", className: "name", sortKey: "name" },
    {
      content: "Mapped groups",
      sortKey: "groups",
      className: "u-align--right mapped-groups",
    },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const filteredGroups = groups.filter(
    (idpGroup) => !search || idpGroup.name.toLowerCase().includes(search),
  );

  const selectedGroups = groups.filter((group) =>
    selectedGroupNames.includes(group.name),
  );

  const rows = filteredGroups.map((idpGroup) => {
    const getGroupLink = () => {
      if (canEditIdpGroup(idpGroup)) {
        return (
          <Button
            appearance="link"
            dense
            onClick={() => {
              panelParams.openEditIdpGroup(idpGroup.name);
            }}
          >
            {idpGroup.groups.length}
          </Button>
        );
      }

      const groupsText = pluralize("group", idpGroup.groups?.length ?? 0);
      const groupsList = idpGroup.groups?.join("\n- ");
      const groupsTitle = `Assigned ${groupsText}:\n- ${groupsList}`;
      return (
        <div title={idpGroup.groups?.length ? groupsTitle : ""}>
          {idpGroup.groups?.length || 0}
        </div>
      );
    };

    return {
      key: idpGroup.name,
      name: idpGroup.name,
      className: "u-row",
      columns: [
        {
          content: idpGroup.name,
          role: "rowheader",
          "aria-label": "Name",
          className: "u-truncate",
          title: idpGroup.name,
        },
        {
          content: getGroupLink(),
          role: "cell",
          className: "u-align--right mapped-groups",
          "aria-label": "Number of mapped groups",
        },
        {
          className: "actions u-align--right",
          content: (
            <List
              inline
              className="u-no-margin--bottom actions-list"
              items={[
                <Button
                  key={`edit-${idpGroup.name}`}
                  appearance="base"
                  hasIcon
                  dense
                  onClick={() => {
                    panelParams.openEditIdpGroup(idpGroup.name);
                  }}
                  type="button"
                  aria-label="Edit IDP group details"
                  title={
                    canEditIdpGroup(idpGroup)
                      ? "Edit details"
                      : "You do not have permission to modify this IDP group"
                  }
                  disabled={!canEditIdpGroup(idpGroup)}
                >
                  <Icon name="edit" />
                </Button>,
                <DeleteIdpGroupBtn
                  key={`delete-${idpGroup.name}`}
                  idpGroup={idpGroup}
                />,
              ]}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: idpGroup.name.toLowerCase(),
        groups: idpGroup.groups.length,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    if (selectedGroupNames.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={groups.length ?? 0}
          itemName="IDP group"
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
  const infoStyle = hasGroups ? "u-text--muted u-no-max-width" : "";
  const idpGroupsInfo = (
    <>
      <p className={infoStyle}>
        Identity provider groups map authentication entities from your identity
        provider to groups within LXD.
      </p>
      {!hasCustomClaim ? (
        <p className={infoStyle}>
          You need to set your server{" "}
          <Link to="/ui/settings">
            configuration (<code>oidc.groups.claim</code>)
          </Link>{" "}
          to the name of the custom claim that provides the IDP groups.
        </p>
      ) : (
        ""
      )}
      <p className={infoStyle}>
        <a
          href={`${docBaseLink}/explanation/authorization/#use-groups-defined-by-the-identity-provider`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about IDP groups
          <Icon className="external-link-icon" name="external-link" />
        </a>
      </p>
    </>
  );

  const content = hasGroups ? (
    <>
      <Card>{idpGroupsInfo}</Card>
      <ScrollableTable
        dependencies={[groups]}
        tableId="idp-groups-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="IDP group"
          className="u-no-margin--top"
          aria-label="Table pagination control"
          description={getTablePaginationDescription()}
        >
          <SelectableMainTable
            id="idp-groups-table"
            className="permission-idp-group-table"
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="No identity provider groups found matching this search"
            onUpdateSort={updateSort}
            itemName="IDP group"
            parentName=""
            selectedNames={selectedGroupNames}
            setSelectedNames={setSelectedGroupNames}
            disabledNames={[]}
            filteredNames={filteredGroups.map((item) => item.name)}
            disableSelect={!!panelParams.panel}
          />
        </TablePagination>
      </ScrollableTable>
    </>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="user-group" className="empty-state-icon" />}
      title="No IDP group mappings"
    >
      {idpGroupsInfo}
      <Button
        className="empty-state-button"
        appearance="positive"
        onClick={panelParams.openCreateIdpGroup}
        disabled={!canCreateIdpGroups()}
        title={
          canCreateIdpGroups()
            ? ""
            : "You do not have permission to create IDP groups"
        }
        hasIcon={!isSmallScreen}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>Create IDP group</span>
      </Button>
    </EmptyState>
  );

  return (
    <>
      <CustomLayout
        mainClassName="permission-idp-groups-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  href={`${docBaseLink}/explanation/authorization`}
                  title="Learn more about permissions"
                >
                  IDP&nbsp;groups
                </HelpLink>
              </PageHeader.Title>
              {!selectedGroupNames.length && hasGroups ? (
                <PageHeader.Search>
                  <PermissionGroupsFilter
                    onChange={setSearch}
                    value={search}
                    disabled={!!panelParams.idpGroup}
                  />
                </PageHeader.Search>
              ) : null}
              {selectedGroupNames.length > 0 && !panelParams.panel && (
                <>
                  <BulkDeleteIdpGroupsBtn idpGroups={selectedGroups} />
                </>
              )}
            </PageHeader.Left>
            {hasGroups && (
              <PageHeader.BaseActions>
                {!selectedGroupNames.length && (
                  <Button
                    appearance="positive"
                    className="u-no-margin--bottom u-float-right"
                    onClick={panelParams.openCreateIdpGroup}
                    disabled={!canCreateIdpGroups()}
                    title={
                      canCreateIdpGroups()
                        ? ""
                        : "You do not have permission to create IDP groups"
                    }
                    hasIcon={!isSmallScreen}
                  >
                    {!isSmallScreen && <Icon name="plus" light />}
                    <span>Create IDP group</span>
                  </Button>
                )}
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row>{content}</Row>
      </CustomLayout>

      {panelParams.panel === panels.createIdpGroup && <CreateIdpGroupPanel />}

      {panelParams.panel === panels.editIdpGroup &&
        selectedGroups.length > 0 && (
          <EditIdpGroupPanel
            idpGroup={selectedGroups[0]}
            onClose={() => {
              setSelectedGroupNames([]);
            }}
          />
        )}
    </>
  );
};

export default PermissionIdpGroups;
