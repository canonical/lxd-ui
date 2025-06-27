import type { FC } from "react";
import classnames from "classnames";
import { List, useToastNotification } from "@canonical/react-components";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import ResourceLabel from "components/ResourceLabel";
import DeleteStorageBucketKeyBtn from "./DeleteStorageBucketKeyBtn";

interface Props {
  bucketKey: LxdStorageBucketKey;
  bucket: LxdStorageBucket;
  className?: string;
}

const StorageBucketKeyActions: FC<Props> = ({
  bucketKey,
  bucket,
  className,
}) => {
  const toastNotify = useToastNotification();

  const menuElements = [
    // <EditStorageBucketBtn
    //   key="edit"
    //   classname={classnames(className, "has-icon")}
    //   bucket={bucket}
    //   isDetailPage={isDetailPage}
    // />,
    <DeleteStorageBucketKeyBtn
      key="delete"
      bucketKey={bucketKey}
      classname={classnames(className, "has-icon")}
      bucket={bucket}
      onFinish={() => {
        toastNotify.success(
          <>
            Bucket key{" "}
            <ResourceLabel bold type="bucket" value={bucketKey.name} /> deleted.
          </>,
        );
      }}
    />,
  ];
  return (
    <List
      inline
      className={classnames(className, "u-no-margin--bottom actions-list")}
      items={menuElements}
    />
  );
};

export default StorageBucketKeyActions;
