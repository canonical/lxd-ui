import type { FC } from "react";
import type { LxdStorageBucket } from "types/storage";
import { Button, Icon } from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { useCurrentProject } from "context/useCurrentProject";
import usePanelParams from "util/usePanelParams";

interface Props {
  bucket: LxdStorageBucket;
}

const EditStorageBucketBtn: FC<Props> = ({ bucket }) => {
  const panelParams = usePanelParams();
  const { canEditBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();

  return (
    <Button
      key={`${bucket.name}-edit`}
      appearance="base"
      hasIcon
      onClick={() => {
        panelParams.openEditStorageBucket(bucket.name, project?.name || "");
      }}
      title={
        canEditBucket(bucket)
          ? "Edit bucket"
          : "You do not have permission to edit buckets in this project"
      }
    >
      <Icon name="edit" />
    </Button>
  );
};

export default EditStorageBucketBtn;
