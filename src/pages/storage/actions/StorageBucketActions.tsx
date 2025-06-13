import type { FC } from "react";
import classnames from "classnames";
import { List, useToastNotification } from "@canonical/react-components";
import type { LxdStorageBucket } from "types/storage";
import ResourceLabel from "components/ResourceLabel";
import DeleteStorageBucketBtn from "./DeleteStorageBucketBtn";
import EditStorageBucketBtn from "./EditStorageBucketBtn";

interface Props {
  bucket: LxdStorageBucket;
  className?: string;
}

const StorageBucketActions: FC<Props> = ({ bucket, className }) => {
  const toastNotify = useToastNotification();

  return (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={[
        <EditStorageBucketBtn key="edit" bucket={bucket} />,
        <DeleteStorageBucketBtn
          key="delete"
          bucket={bucket}
          onFinish={() => {
            toastNotify.success(
              <>
                Storage bucket{" "}
                <ResourceLabel bold type="bucket" value={bucket.name} />{" "}
                deleted.
              </>,
            );
          }}
        />,
      ]}
    />
  );
};

export default StorageBucketActions;
