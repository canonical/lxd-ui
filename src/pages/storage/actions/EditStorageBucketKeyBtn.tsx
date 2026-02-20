import type { FC } from "react";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { Button, Icon } from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import usePanelParams from "util/usePanelParams";

interface Props {
  bucketKey: LxdStorageBucketKey;
  bucket: LxdStorageBucket;
}

const EditStorageBucketKeyBtn: FC<Props> = ({ bucket, bucketKey }) => {
  const panelParams = usePanelParams();
  const { canEditBucket } = useStorageBucketEntitlements();

  return (
    <Button
      className="has-icon"
      appearance="base"
      hasIcon
      onClick={() => {
        panelParams.openEditStorageBucketKey(bucketKey.name);
      }}
      title={
        canEditBucket(bucket)
          ? "Edit bucket key"
          : "You do not have permission to edit this bucket key"
      }
    >
      <Icon name="edit" />
    </Button>
  );
};

export default EditStorageBucketKeyBtn;
