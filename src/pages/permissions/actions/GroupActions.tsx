import type { FC } from "react";
import { Button, Icon, List, usePortal } from "@canonical/react-components";
import type { LxdAuthGroup } from "types/permissions";
import usePanelParams from "util/usePanelParams";
import DeleteGroupModal from "./DeleteGroupModal";
import { useGroupEntitlements } from "util/entitlements/groups";
import { isAdminGroup } from "util/permissionGroups";

interface Props {
  group: LxdAuthGroup;
}

const GroupActions: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canDeleteGroup, canEditGroup } = useGroupEntitlements();

  const getTitle = () => {
    if (isAdminGroup(group)) {
      return "Admins group cannot be deleted";
    }
    if (canDeleteGroup(group)) {
      return "Delete group";
    }
    return "You do not have permission to delete this group";
  };

  return (
    <>
      <List
        inline
        className="u-no-margin--bottom actions-list"
        items={[
          <Button
            key="edit"
            appearance="base"
            dense
            hasIcon
            onClick={() => {
              panelParams.openEditGroup(group.name);
            }}
            type="button"
            title={
              canEditGroup(group)
                ? "Edit group"
                : "You do not have permission to edit this group"
            }
            disabled={!canEditGroup(group)}
          >
            <Icon name="edit" />
          </Button>,
          <Button
            key="delete"
            appearance="base"
            dense
            hasIcon
            onClick={openPortal}
            type="button"
            title={getTitle()}
            disabled={isAdminGroup(group) || !canDeleteGroup(group)}
          >
            <Icon name="delete" />
          </Button>,
        ]}
      />
      {isOpen && (
        <Portal>
          <DeleteGroupModal groups={[group]} close={closePortal} />
        </Portal>
      )}
    </>
  );
};

export default GroupActions;
