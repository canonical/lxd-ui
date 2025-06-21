import { cloneElement, useState, type FC } from "react";
import classnames from "classnames";
import {
  ContextualMenu,
  List,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdStorageBucket } from "types/storage";
import ResourceLabel from "components/ResourceLabel";
import DeleteStorageBucketBtn from "./DeleteStorageBucketBtn";
import EditStorageBucketBtn from "./EditStorageBucketBtn";
import { useNavigate } from "react-router-dom";
import { isWidthBelow } from "util/helpers";
import useEventListener from "util/useEventListener";
import { useCurrentProject } from "context/useCurrentProject";

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
  const [isSmallScreen, setIsSmallScreen] = useState(isWidthBelow(1200));
  const navigate = useNavigate();
  const { project } = useCurrentProject();
  const toastNotify = useToastNotification();

  useEventListener("resize", () => {
    setIsSmallScreen(isWidthBelow(1200));
  });

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
      onFinish={() => {
        navigate(`/ui/project/${project?.name}/storage/buckets`);
        toastNotify.success(
          <>
            Storage bucket{" "}
            <ResourceLabel bold type="bucket" value={bucket.name} /> deleted.
          </>,
        );
      }}
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
