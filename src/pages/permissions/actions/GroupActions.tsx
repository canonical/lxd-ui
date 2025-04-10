import type { FC } from "react";
import { Button, Icon, List } from "@canonical/react-components";
import type { LxdGroup } from "types/permissions";
import usePanelParams from "util/usePanelParams";
import DeleteGroupModal from "./DeleteGroupModal";
import { usePortal } from "@canonical/react-components";
import { useGroupEntitlements } from "util/entitlements/groups";

interface Props {
  group: LxdGroup;
}

const GroupActions: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canDeleteGroup } = useGroupEntitlements();

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
            title="Edit group"
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
            title={
              canDeleteGroup(group)
                ? "Delete group"
                : "You do not have permission to delete this group"
            }
            disabled={!canDeleteGroup(group)}
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
