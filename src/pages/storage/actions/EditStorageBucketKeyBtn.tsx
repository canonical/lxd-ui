import type { FC } from "react";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { Button } from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import usePanelParams from "util/usePanelParams";
import DsIcon from "components/DsIcon";

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
      <DsIcon icon="edit" />
    </Button>
  );
};

export default EditStorageBucketKeyBtn;
