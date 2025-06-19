import type { FC } from "react";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import type { LxdStorageBucket } from "types/storage";
import { getStorageBucketURL } from "util/storageBucket";

interface Props {
  bucket: LxdStorageBucket;
  project: string;
}

const StorageBucketLink: FC<Props> = ({ bucket, project }) => {
  return (
    <Link
      to={getStorageBucketURL(bucket.name, bucket.pool, project)}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ItemName item={bucket} />
    </Link>
  );
};

export default StorageBucketLink;
