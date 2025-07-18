import type { FC, ReactElement } from "react";
import { cloneElement } from "react";
import EvacuateClusterMemberBtn from "pages/cluster/actions/EvacuateClusterMemberBtn";
import RestoreClusterMemberBtn from "pages/cluster/actions/RestoreClusterMemberBtn";
import EditClusterMemberBtn from "pages/cluster/actions/EditClusterMemberBtn";
import type { LxdClusterMember } from "types/cluster";
import { ContextualMenu, List } from "@canonical/react-components";
import {
  smallScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";

interface Props {
  member?: LxdClusterMember;
  isDetailPage?: boolean;
}

const ClusterMemberActions: FC<Props> = ({ member, isDetailPage = false }) => {
  const isSmallScreen = useIsScreenBelow(smallScreenBreakpoint);

  if (!member) {
    return null;
  }

  const classname = isDetailPage
    ? isSmallScreen
      ? "p-contextual-menu__link"
      : "p-segmented-control__button"
    : "";

  const actions: ReactElement<{
    onClose: () => void;
  }>[] = [];

  actions.push(
    <RestoreClusterMemberBtn
      key="restore"
      member={member}
      hasLabel={isDetailPage}
      className={classname}
    />,
  );

  actions.push(
    <EvacuateClusterMemberBtn
      key="evacuate"
      member={member}
      hasLabel={isDetailPage}
      className={classname}
    />,
  );

  actions.push(
    <EditClusterMemberBtn
      key="edit"
      member={member.server_name}
      hasLabel={isDetailPage}
      className={classname}
    />,
  );

  if (isDetailPage) {
    return isSmallScreen ? (
      <ContextualMenu
        closeOnOutsideClick={false}
        toggleLabel="Actions"
        position="left"
        hasToggleIcon
        title="actions"
      >
        {(close: () => void) => (
          <span>
            {[...actions].map((item) => cloneElement(item, { onClose: close }))}
          </span>
        )}
      </ContextualMenu>
    ) : (
      <div className="p-segmented-control">
        <div className="p-segmented-control__list">{...actions}</div>
      </div>
    );
  }

  return <List inline className="actions-list" items={actions} />;
};

export default ClusterMemberActions;
