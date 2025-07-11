import type { FC } from "react";
import { useState } from "react";
import EvacuateClusterMemberBtn from "pages/cluster/actions/EvacuateClusterMemberBtn";
import RestoreClusterMemberBtn from "pages/cluster/actions/RestoreClusterMemberBtn";
import EditClusterMemberBtn from "pages/cluster/actions/EditClusterMemberBtn";
import type { LxdClusterMember } from "types/cluster";
import { isWidthBelow } from "util/helpers";
import useEventListener from "util/useEventListener";
import { List } from "@canonical/react-components";

interface Props {
  member?: LxdClusterMember;
  isDetailPage?: boolean;
}

const ClusterMemberActions: FC<Props> = ({ member, isDetailPage = false }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(isWidthBelow(1200));

  useEventListener("resize", () => {
    setIsSmallScreen(isWidthBelow(1200));
  });

  if (!member) {
    return null;
  }

  const classname = isDetailPage
    ? isSmallScreen
      ? "p-contextual-menu__link"
      : "p-segmented-control__button"
    : "";

  const actions = [];

  if (member.status === "Online") {
    actions.push(
      <EvacuateClusterMemberBtn
        key="evacuate"
        member={member}
        hasLabel={isDetailPage}
        className={classname}
      />,
    );
  }

  if (member.status === "Evacuated") {
    actions.push(
      <RestoreClusterMemberBtn
        key="restore"
        member={member}
        hasLabel={isDetailPage}
        className={classname}
      />,
    );
  }

  actions.push(
    <EditClusterMemberBtn
      key="edit"
      member={member}
      hasLabel={isDetailPage}
      className={classname}
    />,
  );

  if (isDetailPage) {
    return (
      <div className="p-segmented-control">
        <div className="p-segmented-control__list">{...actions}</div>
      </div>
    );
  }

  return <List inline className="actions-list" items={actions} />;
};

export default ClusterMemberActions;
