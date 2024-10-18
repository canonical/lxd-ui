import { useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "api/auth-groups";
import SidePanel from "components/SidePanel";
import { FC, useEffect, useState } from "react";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import { getGroupsForIdentities } from "util/permissionIdentities";
import useEditHistory from "util/useEditHistory";
import IdentityGroupsPanelConfirmModal from "./IdentityGroupsPanelConfirmModal";
import { LxdIdentity } from "types/permissions";
import NotificationRow from "components/NotificationRow";
import GroupSelection from "./GroupSelection";
import GroupSelectionActions from "../actions/GroupSelectionActions";

type GroupEditHistory = {
  groupsAdded: Set<string>;
  groupsRemoved: Set<string>;
};

interface Props {
  identities: LxdIdentity[];
  onClose: () => void;
}

const EditIdentityGroupsPanel: FC<Props> = ({ identities, onClose }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const [confirming, setConfirming] = useState(false);

  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.authGroups],
    queryFn: fetchGroups,
  });

  const {
    desiredState,
    save: saveToPanelHistory,
    undo: undoGroupChange,
  } = useEditHistory<GroupEditHistory>({
    initialState: {
      groupsAdded: new Set(),
      groupsRemoved: new Set(),
    },
  });

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  // in case if user refresh the browser while the panel is open
  useEffect(() => {
    if (!identities.length) {
      panelParams.clear();
      return;
    }
  }, [identities]);

  const {
    groupsForAllIdentities,
    groupsForSomeIdentities,
    groupsForNoIdentities,
  } = getGroupsForIdentities(groups, identities);

  const selectedGroups = new Set<string>(desiredState.groupsAdded);

  for (const group of groupsForAllIdentities) {
    if (!desiredState.groupsRemoved.has(group)) {
      selectedGroups.add(group);
    }
  }

  const indeterminateGroups = new Set(
    groupsForSomeIdentities.filter(
      (groupName) =>
        !selectedGroups.has(groupName) &&
        !desiredState.groupsRemoved.has(groupName),
    ),
  );

  const calculatedModifiedGroups = () => {
    const modifiedGroups = new Set<string>();

    for (const group of groupsForAllIdentities) {
      if (!selectedGroups.has(group)) {
        modifiedGroups.add(group);
      }
    }

    for (const group of groupsForSomeIdentities) {
      if (!indeterminateGroups.has(group)) {
        modifiedGroups.add(group);
      }
    }

    for (const group of groupsForNoIdentities) {
      if (selectedGroups.has(group)) {
        modifiedGroups.add(group);
      }
    }

    return modifiedGroups;
  };

  const modifyGroups = (
    newselectedGroups: string[],
    isUnselectAll?: boolean,
  ) => {
    if (isUnselectAll) {
      saveToPanelHistory({
        groupsAdded: new Set(),
        groupsRemoved: new Set(groups.map((group) => group.name)),
      });
    } else {
      saveToPanelHistory({
        groupsAdded: new Set(newselectedGroups),
        groupsRemoved: new Set(),
      });
    }
  };

  // need to do this outside of SelectableMainTable so we can cater for the case of
  // unselecting a checkbox when initially a checkbox is indeterminate
  const toggleRow = (rowName: string) => {
    const isRowSelected = selectedGroups.has(rowName);
    const isRowIndeterminate = indeterminateGroups.has(rowName);
    // always create new sets to avoid mutation by reference
    const groupsAdded = new Set(desiredState.groupsAdded);
    const groupsRemoved = new Set(desiredState.groupsRemoved);

    if (isRowSelected || isRowIndeterminate) {
      groupsAdded.delete(rowName);
      groupsRemoved.add(rowName);
    } else {
      groupsAdded.add(rowName);
      groupsRemoved.delete(rowName);
    }

    saveToPanelHistory({
      groupsAdded,
      groupsRemoved,
    });
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    setConfirming(false);
    onClose();
  };

  const closeModal = () => {
    notify.clear();
    setConfirming(false);
  };

  const modifiedGroups = calculatedModifiedGroups();

  const panelTitle =
    identities.length > 1
      ? `Change groups for ${identities.length} identities`
      : `Change groups for ${identities[0]?.name}`;

  return (
    <>
      <SidePanel
        isOverlay
        loading={isLoading}
        hasError={!groups}
        onClose={closePanel}
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle>{panelTitle}</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <GroupSelection
            groups={groups}
            modifiedGroups={modifiedGroups}
            parentItemName="identity"
            parentItems={identities}
            selectedGroups={selectedGroups}
            setSelectedGroups={modifyGroups}
            indeterminateGroups={indeterminateGroups}
            toggleGroup={toggleRow}
            scrollDependencies={[modifiedGroups.size, notify.notification]}
          />
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <GroupSelectionActions
            modifiedGroups={modifiedGroups}
            undoChange={undoGroupChange}
            closePanel={closePanel}
            onSubmit={() => setConfirming(true)}
            disabled={modifiedGroups.size === 0}
          />
        </SidePanel.Footer>
      </SidePanel>
      {confirming && (
        <IdentityGroupsPanelConfirmModal
          close={closeModal}
          onConfirm={closeModal}
          selectedIdentities={identities}
          addedGroups={desiredState.groupsAdded}
          removedGroups={desiredState.groupsRemoved}
        />
      )}
    </>
  );
};

export default EditIdentityGroupsPanel;
