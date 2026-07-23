import {
  ScrollableContainer,
  SidePanel,
  Spinner,
} from "@canonical/react-components";
import { useEffect, useState, type FC } from "react";
import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import GroupSelection from "./GroupSelection";
import GroupSelectionActions from "../actions/GroupSelectionActions";

export interface IdentityGroupChanges {
  currentGroups: Set<string>;
  addedGroups: Set<string>;
  removedGroups: Set<string>;
}

interface Props {
  identity?: LxdIdentity;
  isLoading: boolean;
  groups: LxdAuthGroup[];
  canEdit: boolean;
  notifyNotification: unknown;
  closePanel: () => void;
  onSubmit: (changes: IdentityGroupChanges) => void;
}

const EditIdentityGroupsSection: FC<Props> = ({
  identity,
  isLoading,
  groups,
  canEdit,
  notifyNotification,
  closePanel,
  onSubmit,
}) => {
  const identityId = identity?.id ?? "";
  const authMethod = identity?.authentication_method ?? "";

  const [selectedGroups, setSelectedGroupsState] = useState<Set<string> | null>(
    null,
  );

  useEffect(() => {
    if (!identity) {
      setSelectedGroupsState(null);
      return;
    }

    setSelectedGroupsState(new Set(identity.groups ?? []));
  }, [identityId, authMethod]);

  const originalGroups = new Set(identity?.groups ?? []);
  const groupSelection = selectedGroups ?? originalGroups;

  const modifiedGroups = new Set<string>();
  for (const group of groups) {
    const isSelected = groupSelection.has(group.name);
    const wasSelected = originalGroups.has(group.name);
    if (isSelected !== wasSelected) {
      modifiedGroups.add(group.name);
    }
  }

  const toggleGroup = (groupName: string) => {
    if (!canEdit) {
      return;
    }
    const newSelection = new Set(groupSelection);
    if (newSelection.has(groupName)) {
      newSelection.delete(groupName);
    } else {
      newSelection.add(groupName);
    }
    setSelectedGroupsState(newSelection);
  };

  const setSelectedGroups = (
    newSelectedGroups: string[],
    isUnselectAll?: boolean,
  ) => {
    if (!canEdit) {
      return;
    }
    if (isUnselectAll) {
      setSelectedGroupsState(new Set());
    } else {
      setSelectedGroupsState(new Set(newSelectedGroups));
    }
  };

  const undoGroupChanges = () => {
    setSelectedGroupsState(new Set(originalGroups));
  };

  const addedGroups = new Set(
    Array.from(modifiedGroups).filter((group) => groupSelection.has(group)),
  );
  const removedGroups = new Set(
    Array.from(modifiedGroups).filter((group) => !groupSelection.has(group)),
  );

  return (
    <>
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notifyNotification, identity]}
          belowIds={["panel-footer"]}
        >
          {isLoading && <Spinner text="Loading identity details..." />}
          {identity && (
            <>
              <label htmlFor="group-selection-table">Auth groups</label>
              <GroupSelection
                groups={groups}
                modifiedGroups={modifiedGroups}
                parentItemName="identity"
                parentItems={[identity]}
                selectedGroups={groupSelection}
                setSelectedGroups={setSelectedGroups}
                toggleGroup={toggleGroup}
                scrollDependencies={[
                  groups,
                  modifiedGroups.size,
                  notifyNotification,
                ]}
                disabled={!canEdit}
              />
            </>
          )}
        </ScrollableContainer>
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <div id="panel-footer">
          <GroupSelectionActions
            modifiedGroups={modifiedGroups}
            undoChange={undoGroupChanges}
            closePanel={closePanel}
            onSubmit={() => {
              onSubmit({
                currentGroups: groupSelection,
                addedGroups,
                removedGroups,
              });
            }}
            disabled={modifiedGroups.size === 0 || !canEdit}
            isEdit
          />
        </div>
      </SidePanel.Footer>
    </>
  );
};

export default EditIdentityGroupsSection;
