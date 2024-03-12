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
import { useQuery } from "@tanstack/react-query";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { FC, useEffect, useState } from "react";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import usePanelParams, { panels } from "util/usePanelParams";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import PermissionGroupsFilter from "./PermissionGroupsFilter";
import { fetchIdpGroups } from "api/auth-idp-groups";
import CreateIdpGroupPanel from "./panels/CreateIdpGroupPanel";
import BulkDeleteIdpGroupsBtn from "./actions/BulkDeleteIdpGroupsBtn";
import EditIdpGroupPanel from "./panels/EditIdpGroupPanel";
import DeleteIdepGroupBtn from "./actions/DeleteIdpGroupBtn";
import { useSettings } from "context/useSettings";
import { Link } from "react-router-dom";

const PermissionIdpGroups: FC = () => {
  const notify = useNotify();
  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.idpGroups],
    queryFn: fetchIdpGroups,
  });
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [search, setSearch] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const { data: settings } = useSettings();
  const hasCustomClaim = settings?.config?.["oidc.groups.claim"];

  if (error) {
    notify.failure("Loading provider groups failed", error);
  }

  useEffect(() => {
    if (panelParams.idpGroup) {
      setSelectedGroupNames([panelParams.idpGroup]);
    }
  }, [panelParams.idpGroup]);

  const headers = [
    { content: "Name", className: "name", sortKey: "name" },
    {
      content: "Mapped groups",
      sortKey: "groups",
      className: "u-align--right",
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
    return {
      name: idpGroup.name,
      className: "u-row",
      columns: [
        {
          content: idpGroup.name,
          role: "cell",
          "aria-label": "Name",
          className: "u-truncate",
          title: idpGroup.name,
        },
        {
          content: idpGroup.groups.length,
          role: "cell",
          className: "u-align--right",
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
                  onClick={() => panelParams.openEditIdpGroup(idpGroup.name)}
                  type="button"
                  aria-label="Edit IDP group details"
                  title="Edit details"
                >
                  <Icon name="edit" />
                </Button>,
                <DeleteIdepGroupBtn
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
    return <Loader text="Loading identity provider groups" />;
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
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="No identity provider groups found matching this search"
            onUpdateSort={updateSort}
            itemName="IDP group"
            parentName=""
            selectedNames={selectedGroupNames}
            setSelectedNames={setSelectedGroupNames}
            processingNames={[]}
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
      >
        Create IDP group
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
                  Identity&nbsp;provider&nbsp;groups
                </HelpLink>
              </PageHeader.Title>
              {!selectedGroupNames.length && hasGroups && (
                <PageHeader.Search>
                  <PermissionGroupsFilter
                    onChange={setSearch}
                    value={search}
                    disabled={!!panelParams.idpGroup}
                  />
                </PageHeader.Search>
              )}
              {selectedGroupNames.length > 0 && !panelParams.panel && (
                <>
                  <BulkDeleteIdpGroupsBtn
                    idpGroups={selectedGroups}
                    className="u-no-margin--bottom"
                    onDelete={() => setSelectedGroupNames([])}
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
                    onClick={panelParams.openCreateIdpGroup}
                  >
                    Create IDP group
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

      {panelParams.panel === panels.editIdpGroup && selectedGroups.length && (
        <EditIdpGroupPanel idpGroup={selectedGroups[0]} />
      )}
    </>
  );
};

export default PermissionIdpGroups;
