import { useEffect, useState, type FC } from "react";
import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import GroupSelection from "./GroupSelection";

export interface IdentityGroupChanges {
  currentGroups: Set<string>;
  addedGroups: Set<string>;
  removedGroups: Set<string>;
}

interface Props {
  identity?: LxdIdentity;
  groups: LxdAuthGroup[];
  canEdit: boolean;
  onChange: (
    changes: IdentityGroupChanges,
    modifiedGroups: Set<string>,
  ) => void;
}

const EditIdentityGroupsSection: FC<Props> = ({
  identity,
  groups,
  canEdit,
  onChange,
}) => {
  const identityId = identity?.id ?? "";

  const [selectedGroups, setSelectedGroupsState] = useState<Set<string> | null>(
    null,
  );

  useEffect(() => {
    if (!identity) {
      setSelectedGroupsState(null);
      return;
    }

    const initialGroups = new Set(identity.groups ?? []);
    setSelectedGroupsState(initialGroups);
    onChange(
      {
        currentGroups: initialGroups,
        addedGroups: new Set<string>(),
        removedGroups: new Set<string>(),
      },
      new Set<string>(),
    );
  }, [identityId]);

  const originalGroups = new Set(identity?.groups ?? []);
  const groupSelection = selectedGroups ?? originalGroups;

  const getGroupChanges = (currentGroups: Set<string>) => {
    const modifiedGroups = new Set<string>();
    for (const group of groups) {
      const isSelected = currentGroups.has(group.name);
      const wasSelected = originalGroups.has(group.name);
      if (isSelected !== wasSelected) {
        modifiedGroups.add(group.name);
      }
    }

    const addedGroups = new Set(
      Array.from(modifiedGroups).filter((group) => currentGroups.has(group)),
    );
    const removedGroups = new Set(
      Array.from(modifiedGroups).filter((group) => !currentGroups.has(group)),
    );

    return {
      modifiedGroups,
      changes: {
        currentGroups,
        addedGroups,
        removedGroups,
      },
    };
  };

  const { modifiedGroups } = getGroupChanges(groupSelection);

  const updateSelection = (currentGroups: Set<string>) => {
    setSelectedGroupsState(currentGroups);
    const { changes, modifiedGroups } = getGroupChanges(currentGroups);
    onChange(changes, modifiedGroups);
  };

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
    updateSelection(newSelection);
  };

  const setSelectedGroups = (
    newSelectedGroups: string[],
    isUnselectAll?: boolean,
  ) => {
    if (!canEdit) {
      return;
    }
    if (isUnselectAll) {
      updateSelection(new Set());
    } else {
      updateSelection(new Set(newSelectedGroups));
    }
  };

  return (
    <>
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
            scrollDependencies={[groups, modifiedGroups.size, identity]}
            disabled={!canEdit}
            hasScrollableTable={false}
          />
        </>
      )}
    </>
  );
};

export default EditIdentityGroupsSection;
