import { cloneElement, type FC } from "react";
import { ContextualMenu } from "@canonical/react-components";
import {
  largeScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import DeleteReplicatorBtn from "pages/cluster/actions/DeleteReplicatorBtn";
import EditReplicatorBtn from "pages/cluster/actions/EditReplicatorBtn";
import RunReplicatorBtn from "pages/cluster/actions/RunReplicatorBtn";
import type { LxdReplicator } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
}

const ReplicatorDetailActions: FC<Props> = ({ replicator }) => {
  const isSmallScreen = useIsScreenBelow(largeScreenBreakpoint);
  const classname = isSmallScreen
    ? "p-contextual-menu__link"
    : "p-segmented-control__button";

  const menuElements = [
    <RunReplicatorBtn
      key="run"
      replicator={replicator}
      className={classname}
    />,
    <EditReplicatorBtn
      key="edit"
      replicator={replicator}
      className={classname}
    />,
    <DeleteReplicatorBtn
      key="delete"
      replicator={replicator}
      className={classname}
    />,
  ];

  return (
    <>
      {isSmallScreen ? (
        <ContextualMenu
          closeOnOutsideClick={false}
          toggleLabel="Actions"
          position="left"
          hasToggleIcon
          title="actions"
        >
          {(close: () => void) => (
            <span>
              {[...menuElements].map((item) =>
                cloneElement(item, { onClose: close }),
              )}
            </span>
          )}
        </ContextualMenu>
      ) : (
        <div className="p-segmented-control">
          <div className="p-segmented-control__list">{menuElements}</div>
        </div>
      )}
    </>
  );
};

export default ReplicatorDetailActions;
