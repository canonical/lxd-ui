import {
  Button,
  Icon,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchIdentities } from "api/auth-identities";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { FC, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import PermissionIdentitiesFilter, {
  AUTH_METHOD,
  PermissionIdentitiesFilterType,
  QUERY,
} from "./PermissionIdentitiesFilter";
import { useSettings } from "context/useSettings";
import EditIdentityGroupsBtn from "./actions/EditIdentityGroupsBtn";
import usePanelParams, { panels } from "util/usePanelParams";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import EditIdentityGroupsPanel from "./panels/EditIdentityGroupsPanel";
import Tag from "components/Tag";

const PermissionIdentities: FC = () => {
  const notify = useNotify();
  const {
    data: identities = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });
  const { data: settings } = useSettings();
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const [selectedIdentityIds, setSelectedIdentityIds] = useState<string[]>([]);

  if (error) {
    notify.failure("Loading identities failed", error);
  }

  const headers = [
    { content: "Name", className: "name", sortKey: "name" },
    { content: "ID", sortKey: "id" },
    { content: "Auth method", sortKey: "authmethod" },
    { content: "Type", sortKey: "type" },
    {
      content: "Groups",
      sortKey: "groups",
      className: "u-align--right",
    },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const filters: PermissionIdentitiesFilterType = {
    queries: searchParams.getAll(QUERY),
    authMethod: searchParams.getAll(AUTH_METHOD),
  };

  const filteredIdentities = identities.filter((identity) => {
    if (
      !filters.queries.every(
        (q) =>
          identity.name.toLowerCase().includes(q) ||
          identity.id.toLowerCase().includes(q),
      )
    ) {
      return false;
    }

    if (
      filters.authMethod.length > 0 &&
      !filters.authMethod.includes(identity.authentication_method)
    ) {
      return false;
    }

    return true;
  });

  const selectedIdentities = identities.filter((identity) =>
    selectedIdentityIds.includes(identity.id),
  );

  const rows = filteredIdentities.map((identity) => {
    const isLoggedInIdentity = settings?.auth_user_name === identity.id;
    const isTlsIdentity = identity.authentication_method === "tls";
    return {
      name: isTlsIdentity ? "" : identity.id,
      key: identity.id,
      className: "u-row",
      columns: [
        {
          content: (
            <>
              {identity.name} <Tag isVisible={isLoggedInIdentity}>You</Tag>
            </>
          ),
          role: "cell",
          "aria-label": "Name",
          className: "u-truncate",
          title: identity.name,
        },
        {
          content: identity.id,
          role: "cell",
          "aria-label": "ID",
          className: "u-truncate",
          title: identity.id,
        },
        {
          content: identity.authentication_method.toUpperCase(),
          role: "cell",
          "aria-label": "Auth method",
        },
        {
          content: identity.type,
          role: "cell",
          "aria-label": "Type",
          className: "u-truncate",
          title: identity.type,
        },
        {
          content: identity.groups?.length || 0,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Groups for this identity",
        },
        {
          content: !isTlsIdentity && (
            <Button
              appearance="base"
              hasIcon
              dense
              onClick={() => {
                panelParams.openIdentityGroups(identity.id);
                setSelectedIdentityIds([identity.id]);
              }}
              type="button"
              aria-label="Manage groups"
              title="Manage groups"
            >
              <Icon name="user-group" />
            </Button>
          ),
          className: "actions u-align--right",
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        id: identity.id,
        name: identity.name.toLowerCase(),
        authentication_method: identity.authentication_method,
        type: identity.type,
        groups: identity.groups?.length || 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  // NOTE: tls user group membership cannot be modified, this will be supported in the future
  const nonTlsUsers = identities.filter((identity) => {
    const isTlsIdentity = identity.authentication_method === "tls";
    return !isTlsIdentity;
  });

  if (isLoading) {
    return <Loader text="Loading identities" />;
  }

  const getTablePaginationDescription = () => {
    // This is needed because TablePagination does not cater for plural identity
    const defaultPaginationDescription =
      rows.length > 1
        ? `Showing all ${rows.length} identities`
        : `Showing 1 out of 1 identity`;

    if (selectedIdentityIds.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={nonTlsUsers.length ?? 0}
          itemName="OIDC identity"
          selectedNames={selectedIdentityIds}
          setSelectedNames={setSelectedIdentityIds}
          filteredNames={nonTlsUsers.map((item) => item.id)}
          hideActions={!!panelParams.panel}
        />
      );
    }

    return defaultPaginationDescription;
  };

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
                  Identities
                </HelpLink>
              </PageHeader.Title>
              {!selectedIdentityIds.length && !panelParams.panel && (
                <PageHeader.Search>
                  <PermissionIdentitiesFilter />
                </PageHeader.Search>
              )}
              {!!selectedIdentityIds.length && (
                <EditIdentityGroupsBtn
                  identities={selectedIdentities}
                  className="u-no-margin--bottom"
                />
              )}
            </PageHeader.Left>
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row className="permission-identities">
          <ScrollableTable
            dependencies={[identities]}
            tableId="identities-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="identity"
              className="u-no-margin--top"
              aria-label="Table pagination control"
              description={getTablePaginationDescription()}
            >
              <SelectableMainTable
                id="identities-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="No identities found matching this search"
                onUpdateSort={updateSort}
                itemName="identity"
                parentName=""
                selectedNames={selectedIdentityIds}
                setSelectedNames={setSelectedIdentityIds}
                processingNames={[]}
                filteredNames={nonTlsUsers.map((identity) => identity.id)}
                disableSelect={!!panelParams.panel}
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.identityGroups && (
        <EditIdentityGroupsPanel identities={selectedIdentities} />
      )}
    </>
  );
};

export default PermissionIdentities;
