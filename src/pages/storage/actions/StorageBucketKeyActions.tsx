import type { FC } from "react";
import { List } from "@canonical/react-components";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import DeleteStorageBucketKeyBtn from "./DeleteStorageBucketKeyBtn";
import EditStorageBucketKeyBtn from "./EditStorageBucketKeyBtn";

interface Props {
  bucketKey: LxdStorageBucketKey;
  bucket: LxdStorageBucket;
}

const StorageBucketKeyActions: FC<Props> = ({ bucketKey, bucket }) => {
  const menuElements = [
    <EditStorageBucketKeyBtn
      key="edit"
      bucketKey={bucketKey}
      bucket={bucket}
    />,
    <DeleteStorageBucketKeyBtn
      key="delete"
      bucketKey={bucketKey}
      bucket={bucket}
    />,
  ];
  return (
    <List
      inline
      className="u-no-margin--bottom actions-list"
      items={menuElements}
    />
  );
};

export default StorageBucketKeyActions;
