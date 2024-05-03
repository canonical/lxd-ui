import {
  ActionButton,
  Button,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import { FC, useEffect, useState } from "react";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import { useSearchParams } from "react-router-dom";
import useEditHistory from "util/useEditHistory";
import ModifiedStatusAction from "../actions/ModifiedStatusAction";
import { pluralize } from "util/instanceBulkActions";
import { fetchIdentities } from "api/auth-identities";
import { LxdGroup } from "types/permissions";
import { getCurrentIdentitiesForGroups } from "util/permissionGroups";
import GroupIdentitiesPanelConfirmModal from "./GroupIdentitiesPanelConfirmModal";
import PermissionIdentitiesFilter, {
  AUTH_METHOD,
  PermissionIdentitiesFilterType,
  QUERY,
} from "../PermissionIdentitiesFilter";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import useSortTableData from "util/useSortTableData";

type IdentityEditHistory = {
  identitiesAdded: Set<string>;
  identitiesRemoved: Set<string>;
};

interface Props {
  groups: LxdGroup[];
}

const EditGroupIdentitiesPanel: FC<Props> = ({ groups }) => {
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const notify = useNotify();
  const [confirming, setConfirming] = useState(false);

  const {
    data: identities = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });

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

  const nonTlsIdentities = identities.filter(
    (identity) => identity.authentication_method !== "tls",
  );

  const {
    identityIdsInAllGroups,
    identityIdsInNoGroups,
    identityIdsInSomeGroups,
  } = getCurrentIdentitiesForGroups(groups, nonTlsIdentities);

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
          nonTlsIdentities.map((identity) => identity.id),
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
    { content: "Identity", sortKey: "name", role: "rowheader" },
    {
      content: "",
      role: "rowheader",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filters: PermissionIdentitiesFilterType = {
    queries: searchParams.getAll(QUERY),
    authMethod: searchParams.getAll(AUTH_METHOD),
  };

  const filteredIdentities = nonTlsIdentities.filter((identity) => {
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

  const rows = filteredIdentities.map((identity) => {
    const selectedGroupText =
      groups.length > 1 ? "all selected groups" : `group ${groups[0].name}`;
    const modifiedTitle = desiredState.identitiesAdded.has(identity.id)
      ? `Identity will be added to ${selectedGroupText}`
      : desiredState.identitiesRemoved.has(identity.id)
        ? `Identity will be removed from ${selectedGroupText}`
        : "";

    return {
      name: identity.id,
      className: "u-row",
      columns: [
        {
          content: identity.name,
          role: "cell",
          "aria-label": "Identity",
          title: identity.name,
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
        name: identity.name.toLowerCase(),
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: "name",
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
        processingNames={[]}
        filteredNames={nonTlsIdentities.map((identity) => identity.id)}
        indeterminateNames={Array.from(indeterminateIdentities)}
        onToggleRow={toggleRow}
        hideContextualMenu
      />
    </ScrollableTable>
  );

  const panelTitle =
    groups.length > 1
      ? `Change identities for ${groups.length} groups`
      : `Change identities for ${groups[0]?.name}`;

  const confirmButtonText = modifiedIdentities.size
    ? `Apply ${modifiedIdentities.size} identity ${pluralize("change", modifiedIdentities.size)}`
    : "Modify identities";

  return (
    <>
      <SidePanel isOverlay loading={isLoading} hasError={!identities}>
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
            onClick={() => setConfirming(true)}
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
          allIdentities={nonTlsIdentities}
        />
      )}
    </>
  );
};

export default EditGroupIdentitiesPanel;
