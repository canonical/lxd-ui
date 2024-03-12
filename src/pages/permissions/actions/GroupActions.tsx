import { FC, useRef, useState } from "react";
import { ContextualMenu, Icon } from "@canonical/react-components";
import { LxdGroup } from "types/permissions";
import usePanelParams from "util/usePanelParams";
import DeleteGroupModal from "./DeleteGroupModal";
import usePortal from "react-useportal";
import classnames from "classnames";

interface Props {
  group: LxdGroup;
}

const GroupActions: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [displayAbove, setDisplayAbove] = useState(false);
  const menuRef = useRef<HTMLImageElement>(null);

  const adjustDisplayPosition = () => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const menuPosition = menu.getBoundingClientRect().top;
    const showMenuAbove = menuPosition > window.innerHeight / 1.5;
    setDisplayAbove(showMenuAbove);
  };

  return (
    <>
      <ContextualMenu
        dropdownProps={{ "aria-label": "actions menu" }}
        position="right"
        dropdownClassName={classnames({ "show-menu-above": displayAbove })}
        toggleClassName="u-no-margin--bottom u-no-padding--top u-no-padding--bottom"
        toggleProps={{
          "aria-label": "group actions menu",
        }}
        toggleLabel={
          <img ref={menuRef} src="/ui/assets/icon/contextual-menu.svg" />
        }
        toggleAppearance="base"
        title="Actions"
        onClick={adjustDisplayPosition}
        links={[
          {
            appearance: "base",
            hasIcon: true,
            onClick: () => panelParams.openEditGroup(group.name),
            type: "button",
            "aria-label": "Edit group details",
            title: "Edit group details",
            children: (
              <>
                <Icon name="edit" />
                <span>Edit details</span>
              </>
            ),
          },
          {
            appearance: "base",
            hasIcon: true,
            onClick: () => panelParams.openGroupIdentities(group.name),
            type: "button",
            "aria-label": "Manage identities",
            title: "Manage identities",
            children: (
              <>
                <Icon name="user-group" />
                <span>Manage identities</span>
              </>
            ),
          },
          {
            appearance: "base",
            hasIcon: true,
            onClick: () => panelParams.openGroupPermissions(group.name),
            type: "button",
            "aria-label": "Manage permissions",
            title: "Manage permissions",
            children: (
              <>
                <Icon name="lock-locked" />
                <span>Manage permissions</span>
              </>
            ),
          },
          {
            appearance: "base",
            hasIcon: true,
            onClick: openPortal,
            type: "button",
            "aria-label": "Delete group",
            title: "Delete group",
            children: (
              <>
                <Icon name="delete" />
                <span>Delete</span>
              </>
            ),
          },
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
