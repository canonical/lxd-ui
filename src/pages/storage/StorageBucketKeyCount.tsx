import type { FC } from "react";
import type { LxdStorageBucket } from "types/storage";
import { useBucketKeys } from "context/useBuckets";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  bucket: LxdStorageBucket;
}

const StorageBucketKeyCount: FC<Props> = ({ bucket }) => {
  const { project } = useCurrentProject();
  const { data: bucketKeys = [] } = useBucketKeys(bucket, project?.name ?? "");

  return <>{bucketKeys ? bucketKeys.length : "-"}</>;
};

export default StorageBucketKeyCount;
