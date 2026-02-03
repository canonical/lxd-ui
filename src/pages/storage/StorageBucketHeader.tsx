import type { FC } from "react";
import { Link } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import type { LxdStorageBucket } from "types/storage";
import StorageBucketActions from "./actions/StorageBucketActions";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  bucket: LxdStorageBucket;
  project: string;
}

const StorageBucketHeader: FC<Props> = ({ bucket, project }) => {
  return (
    <RenameHeader
      name={bucket.name}
      parentItems={[
        <Link
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/buckets`}
          key={1}
        >
          Storage buckets
        </Link>,
      ]}
      controls={
        bucket ? <StorageBucketActions bucket={bucket} isDetailPage /> : null
      }
      isLoaded={true}
      renameDisabledReason="Storage buckets cannot be renamed"
    />
  );
};

export default StorageBucketHeader;
