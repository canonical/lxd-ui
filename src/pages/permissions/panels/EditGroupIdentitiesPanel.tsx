import {
  ActionButton,
  Button,
  Icon,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import usePanelParams from "util/usePanelParams";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import { useSearchParams } from "react-router-dom";
import useEditHistory from "util/useEditHistory";
import ModifiedStatusAction from "../actions/ModifiedStatusAction";
import { pluralize } from "util/instanceBulkActions";
import type { LxdGroup } from "types/permissions";
import { getCurrentIdentitiesForGroups } from "util/permissionGroups";
import GroupIdentitiesPanelConfirmModal from "./GroupIdentitiesPanelConfirmModal";
import type { PermissionIdentitiesFilterType } from "../PermissionIdentitiesFilter";
import PermissionIdentitiesFilter, {
  AUTH_METHOD,
  QUERY,
} from "../PermissionIdentitiesFilter";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import useSortTableData from "util/useSortTableData";
import { isUnrestricted } from "util/helpers";
import { useIdentities } from "context/useIdentities";
import { useIdentityEntitlements } from "util/entitlements/identities";
import {
  getIdentityIdsForGroup,
  getIdentityName,
} from "util/permissionIdentities";

interface IdentityEditHistory {
  identitiesAdded: Set<string>;
  identitiesRemoved: Set<string>;
}

interface Props {
  groups: LxdGroup[];
}

const EditGroupIdentitiesPanel: FC<Props> = ({ groups }) => {
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const notify = useNotify();
  const [confirming, setConfirming] = useState(false);

  const { data: identities = [], error, isLoading } = useIdentities();
  const { canEditIdentity } = useIdentityEntitlements();
  const restrictedIdentities = identities.filter(
    (identity) => !canEditIdentity(identity),
  );

  const {
    desiredState,
    save: saveToPanelHistory,
    undo: undoIdentitiesChange,
  } = useEditHistory<IdentityEditHistory>({
    initialState: {
      identitiesAdded: new Set(),
      identitiesRemoved: new Set(),
    },
  });

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  // in case if user refresh the browser while the panel is open
  useEffect(() => {
    if (!groups.length) {
      panelParams.clear();
      return;
    }
  }, [groups]);

  const fineGrainedIdentities = identities.filter(
    (identity) => !isUnrestricted(identity),
  );

  const {
    identityIdsInAllGroups,
    identityIdsInNoGroups,
    identityIdsInSomeGroups,
  } = getCurrentIdentitiesForGroups(groups, fineGrainedIdentities);

  const selectedIdentities = new Set<string>(desiredState.identitiesAdded);
  for (const identity of identityIdsInAllGroups) {
    if (!desiredState.identitiesRemoved.has(identity)) {
      selectedIdentities.add(identity);
    }
  }

  const indeterminateIdentities = new Set<string>(
    identityIdsInSomeGroups.filter(
      (id) =>
        !selectedIdentities.has(id) && !desiredState.identitiesRemoved.has(id),
    ),
  );

  const preselectedIdentities = new Set();
  groups.forEach((group) => {
    getIdentityIdsForGroup(group).forEach((id) =>
      preselectedIdentities.add(id),
    );
  });
  const hasPreselectedIdentities = preselectedIdentities.size > 0;

  const calculatedModifiedIdentities = () => {
    const modifiedIdentities = new Set<string>();

    for (const identity of identityIdsInAllGroups) {
      if (!selectedIdentities.has(identity)) {
        modifiedIdentities.add(identity);
      }
    }

    for (const identity of identityIdsInSomeGroups) {
      if (!indeterminateIdentities.has(identity)) {
        modifiedIdentities.add(identity);
      }
    }

    for (const identity of identityIdsInNoGroups) {
      if (selectedIdentities.has(identity)) {
        modifiedIdentities.add(identity);
      }
    }

    return modifiedIdentities;
  };

  const modifyIdentities = (
    newIdentities: string[],
    isUnselectAll?: boolean,
  ) => {
    if (isUnselectAll) {
      saveToPanelHistory({
        identitiesAdded: new Set(),
        identitiesRemoved: new Set(
          fineGrainedIdentities.map((identity) => identity.id),
        ),
      });
    } else {
      saveToPanelHistory({
        identitiesAdded: new Set(newIdentities),
        identitiesRemoved: new Set(),
      });
    }
  };

  const toggleRow = (rowName: string) => {
    const isRowSelected = selectedIdentities.has(rowName);
    const isRowIndeterminate = indeterminateIdentities.has(rowName);

    const identitiesAdded = new Set(desiredState.identitiesAdded);
    const identitiesRemoved = new Set(desiredState.identitiesRemoved);

    if (isRowSelected || isRowIndeterminate) {
      identitiesAdded.delete(rowName);
      identitiesRemoved.add(rowName);
    } else {
      identitiesAdded.add(rowName);
      identitiesRemoved.delete(rowName);
    }

    saveToPanelHistory({
      identitiesAdded,
      identitiesRemoved,
    });
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    setConfirming(false);
  };

  const closeModal = () => {
    notify.clear();
    setConfirming(false);
  };

  const modifiedIdentities = calculatedModifiedIdentities();

  const headers = [
    { content: "Identity", sortKey: "name" },
    {
      content: "",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filters: PermissionIdentitiesFilterType = {
    queries: searchParams.getAll(QUERY),
    authMethod: searchParams.getAll(AUTH_METHOD),
  };

  const filteredIdentities = fineGrainedIdentities.filter((identity) => {
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

  const rows = filteredIdentities.map((identity) => {
    const selectedGroupText =
      groups.length > 1 ? "all selected groups" : `group ${groups[0].name}`;
    const modifiedTitle = desiredState.identitiesAdded.has(identity.id)
      ? `Identity will be added to ${selectedGroupText}`
      : desiredState.identitiesRemoved.has(identity.id)
        ? `Identity will be removed from ${selectedGroupText}`
        : "";
    const name = getIdentityName(identity);

    return {
      key: identity.id,
      name: identity.id,
      className: "u-row",
      columns: [
        {
          content: name,
          role: "rowheader",
          "aria-label": "Identity",
          title: canEditIdentity(identity)
            ? name
            : "You do not have permission to manage this identity",
        },
        {
          content: modifiedIdentities.has(identity.id) && (
            <Icon name="status-in-progress-small" />
          ),
          role: "cell",
          "aria-label": "Modified status",
          className: "modified-status u-align--right",
          title: modifiedTitle,
        },
      ],
      sortData: {
        name: name.toLowerCase(),
        isPreselected: preselectedIdentities.has(identity.id),
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: hasPreselectedIdentities ? "isPreselected" : "name",
    defaultSortDirection: hasPreselectedIdentities ? "descending" : "ascending",
  });

  const content = (
    <ScrollableTable
      dependencies={[identities, modifiedIdentities.size, notify.notification]}
      tableId="group-identities-table"
      belowIds={["panel-footer"]}
    >
      <SelectableMainTable
        id="group-identities-table"
        headers={headers}
        rows={sortedRows}
        sortable
        emptyStateMsg="No identities found"
        itemName="identity"
        parentName="server"
        selectedNames={Array.from(selectedIdentities)}
        setSelectedNames={modifyIdentities}
        disabledNames={restrictedIdentities.map((identity) => identity.id)}
        filteredNames={fineGrainedIdentities.map((identity) => identity.id)}
        indeterminateNames={Array.from(indeterminateIdentities)}
        onToggleRow={toggleRow}
        hideContextualMenu
        disableSelectAll={!!restrictedIdentities.length}
      />
    </ScrollableTable>
  );

  const confirmButtonText = modifiedIdentities.size
    ? `Apply ${modifiedIdentities.size} identity ${pluralize("change", modifiedIdentities.size)}`
    : "Modify identities";

  const panelTitle =
    groups.length > 1
      ? `Change identities for ${groups.length} groups`
      : `Change identities for ${groups[0]?.name}`;

  return (
    <>
      <SidePanel loading={isLoading} hasError={!identities}>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>{panelTitle}</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <PermissionIdentitiesFilter />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[modifiedIdentities.size, notify.notification]}
            belowIds={["panel-footer"]}
          >
            {content}
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          {modifiedIdentities.size ? (
            <ModifiedStatusAction
              modifiedCount={modifiedIdentities.size}
              onUndoChange={undoIdentitiesChange}
              itemName="identity"
            />
          ) : null}
          <Button
            appearance="base"
            onClick={closePanel}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            onClick={() => {
              setConfirming(true);
            }}
            className="u-no-margin--bottom"
            disabled={modifiedIdentities.size === 0}
          >
            {confirmButtonText}
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
      {confirming && (
        <GroupIdentitiesPanelConfirmModal
          close={closeModal}
          onConfirm={closeModal}
          selectedGroups={groups}
          addedIdentities={desiredState.identitiesAdded}
          removedIdentities={desiredState.identitiesRemoved}
          allIdentities={fineGrainedIdentities}
        />
      )}
    </>
  );
};

export default EditGroupIdentitiesPanel;
