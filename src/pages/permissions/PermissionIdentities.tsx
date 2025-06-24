import {
  Button,
  Icon,
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
import { useSearchParams } from "react-router-dom";
import useSortTableData from "util/useSortTableData";
import type { PermissionIdentitiesFilterType } from "./PermissionIdentitiesFilter";
import PermissionIdentitiesFilter, {
  AUTH_METHOD,
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
import { useIdentities } from "context/useIdentities";
import { useIdentityEntitlements } from "util/entitlements/identities";
import { pluralize } from "util/instanceBulkActions";
import { getIdentityName } from "util/permissionIdentities";
import CreateTLSIdentity from "./CreateTLSIdentity";

const PermissionIdentities: FC = () => {
  const notify = useNotify();
  const { data: identities = [], error, isLoading } = useIdentities();
  const { data: settings } = useSettings();
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const [selectedIdentityIds, setSelectedIdentityIds] = useState<string[]>([]);
  const { hasAccessManagementTLS } = useSupportedFeatures();
  const { canEditIdentity } = useIdentityEntitlements();

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
    { content: "ID", sortKey: "id", className: "identity-id" },
    { content: "Auth method", sortKey: "authmethod", className: "auth-method" },
    { content: "Type", sortKey: "type", className: "identity-type" },
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
          getIdentityName(identity).toLowerCase().includes(q) ||
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

    const getGroupLink = () => {
      if (canEditIdentity(identity)) {
        return (
          <Button appearance="link" dense onClick={openGroupPanelForIdentity}>
            {identity.groups?.length || 0}
          </Button>
        );
      }

      const groupsText = pluralize("group", identity.groups?.length ?? 0);
      const groupsList = identity.groups?.join("\n- ");
      const groupsTitle = `Assigned ${groupsText}:\n- ${groupsList}`;
      return (
        <div title={identity.groups?.length ? groupsTitle : ""}>
          {identity.groups?.length || 0}
        </div>
      );
    };
    const name = getIdentityName(identity);

    return {
      key: identity.id,
      name: isUnrestricted(identity) ? "" : identity.id,
      className: "u-row",
      columns: [
        {
          content: (
            <>
              {name} <Tag isVisible={isLoggedInIdentity}>You</Tag>
            </>
          ),
          role: "rowheader",
          "aria-label": "Name",
          className: "u-truncate",
          title: name,
        },
        {
          content: identity.id,
          role: "cell",
          "aria-label": "ID",
          className: "u-truncate identity-id",
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
          className: "u-truncate identity-type",
        },
        {
          content: getGroupLink(),
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
                title={
                  canEditIdentity()
                    ? "Manage groups"
                    : "You do not have permission to modify this identity"
                }
                disabled={!canEditIdentity(identity)}
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
        name: name.toLowerCase(),
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
    return <Loader isMainComponent />;
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
        mainClassName="permission-identities-list"
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
                <BulkDeleteIdentitiesBtn identities={selectedIdentities} />
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <CreateTlsIdentityBtn
                openPanel={panelParams.openCreateTLSIdentity}
              />
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
                className="permission-identities-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="No identities found matching this search"
                onUpdateSort={updateSort}
                itemName="identity"
                parentName=""
                selectedNames={selectedIdentityIds}
                setSelectedNames={setSelectedIdentityIds}
                disabledNames={[]}
                filteredNames={fineGrainedIdentities.map(
                  (identity) => identity.id,
                )}
                disableSelect={!!panelParams.panel}
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </CustomLayout>
      <CreateTLSIdentity />

      {panelParams.panel === panels.identityGroups && (
        <EditIdentityGroupsPanel
          identities={selectedIdentities}
          onClose={() => {
            setSelectedIdentityIds([]);
          }}
        />
      )}
    </>
  );
};

export default PermissionIdentities;
