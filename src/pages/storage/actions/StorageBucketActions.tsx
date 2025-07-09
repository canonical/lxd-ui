import { cloneElement, type FC } from "react";
import classnames from "classnames";
import { ContextualMenu, List } from "@canonical/react-components";
import type { LxdStorageBucket } from "types/storage";
import DeleteStorageBucketBtn from "./DeleteStorageBucketBtn";
import EditStorageBucketBtn from "./EditStorageBucketBtn";
import {
  largeScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";

interface Props {
  bucket: LxdStorageBucket;
  isDetailPage?: boolean;
  className?: string;
}

const StorageBucketActions: FC<Props> = ({
  bucket,
  className,
  isDetailPage,
}) => {
  const isSmallScreen = useIsScreenBelow(largeScreenBreakpoint);

  const classname = isDetailPage
    ? isSmallScreen
      ? "p-contextual-menu__link"
      : "p-segmented-control__button"
    : "";

  const menuElements = [
    <EditStorageBucketBtn
      key="edit"
      classname={classnames(classname, "has-icon", {
        "is-dense": !isDetailPage,
      })}
      bucket={bucket}
      isDetailPage={isDetailPage}
    />,
    <DeleteStorageBucketBtn
      key="delete"
      classname={classnames(classname, "has-icon", {
        "is-dense": !isDetailPage,
      })}
      bucket={bucket}
      isDetailPage={isDetailPage}
    />,
  ];
  return isDetailPage ? (
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
  ) : (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={menuElements}
    />
  );
};

export default StorageBucketActions;
