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
import { FC, useEffect, useState } from "react";
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
import BulkDeleteIdentitiesBtn from "./actions/BulkDeleteIdentitiesBtn";
import DeleteIdentityBtn from "./actions/DeleteIdentityBtn";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { isUnrestricted } from "util/helpers";
import IdentityResource from "components/IdentityResource";
import CreateTlsIdentityBtn from "./CreateTlsIdentityBtn";

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
  const { hasAccessManagementTLS } = useSupportedFeatures();

  useEffect(() => {
    const validIdentityIds = new Set(identities.map((identity) => identity.id));

    const validSelections = selectedIdentityIds.filter((identity) =>
      validIdentityIds.has(identity),
    );

    if (validSelections.length !== selectedIdentityIds.length) {
      setSelectedIdentityIds(validSelections);
    }
  }, [identities]);

  if (error) {
    notify.failure("Loading identities failed", error);
  }

  const headers = [
    { content: "Name", className: "name", sortKey: "name" },
    { content: "ID", sortKey: "id" },
    { content: "Auth method", sortKey: "authmethod", className: "auth-method" },
    { content: "Type", sortKey: "type" },
    {
      content: "Groups",
      sortKey: "groups",
      className: "u-align--right group-count",
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
    const openGroupPanelForIdentity = () => {
      panelParams.openIdentityGroups(identity.id);
      setSelectedIdentityIds([identity.id]);
    };

    return {
      name: isUnrestricted(identity) ? "" : identity.id,
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
          className: "auth-method",
        },
        {
          content: <IdentityResource identity={identity} truncate={false} />,
          role: "cell",
          "aria-label": "Type",
          className: "u-truncate",
        },
        {
          content: (
            <Button appearance="link" dense onClick={openGroupPanelForIdentity}>
              {identity.groups?.length || 0}
            </Button>
          ),
          role: "cell",
          className: "u-align--right group-count",
          "aria-label": "Groups for this identity",
        },
        {
          content: !isUnrestricted(identity) && (
            <>
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                hasIcon
                dense
                onClick={openGroupPanelForIdentity}
                type="button"
                aria-label="Manage groups"
                title="Manage groups"
              >
                <Icon name="user-group" />
              </Button>
              {hasAccessManagementTLS && (
                <DeleteIdentityBtn identity={identity} />
              )}
            </>
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

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  const fineGrainedIdentities = identities.filter((identity) => {
    return !isUnrestricted(identity);
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
          totalCount={fineGrainedIdentities.length ?? 0}
          itemName="identity"
          selectedNames={selectedIdentityIds}
          setSelectedNames={setSelectedIdentityIds}
          filteredNames={fineGrainedIdentities.map((item) => item.id)}
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
              {!!selectedIdentityIds.length && hasAccessManagementTLS && (
                <BulkDeleteIdentitiesBtn
                  identities={selectedIdentities}
                  className="u-no-margin--bottom"
                />
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <CreateTlsIdentityBtn />
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row>
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
                className="permission-identities"
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
                filteredNames={fineGrainedIdentities.map(
                  (identity) => identity.id,
                )}
                disableSelect={!!panelParams.panel}
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.identityGroups && (
        <EditIdentityGroupsPanel
          identities={selectedIdentities}
          onClose={() => setSelectedIdentityIds([])}
        />
      )}
    </>
  );
};

export default PermissionIdentities;
