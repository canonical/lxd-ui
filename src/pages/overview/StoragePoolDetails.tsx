import StoragePoolSize from "pages/storage/StoragePoolSize";
import { type FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { pluralize } from "util/helpers";

interface Props {
  pool: LxdStoragePool;
  volumeCount: number;
}

const StoragePoolDetails: FC<Props> = ({ pool, volumeCount }) => {
  return (
    <div className="storage-pool-details">
      <p>
        <b>{pool.name}</b>
      </p>
      <p>
        {volumeCount} {pluralize("volume", volumeCount)}
      </p>
      <StoragePoolSize pool={pool} hasMeterBar displayPercentage withColor />
    </div>
  );
};

export default StoragePoolDetails;
