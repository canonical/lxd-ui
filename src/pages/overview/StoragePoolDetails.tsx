import { type FC } from "react";
import { Chip } from "@canonical/react-components";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import type { LxdStoragePool } from "types/storage";
import { pluralize } from "util/helpers";

interface Props {
  pool: LxdStoragePool;
  volumeCount: number;
}

const StoragePoolDetails: FC<Props> = ({ pool, volumeCount }) => {
  return (
    <div className="storage-pool-details">
      <p className="u-truncate" title={pool.name}>
        <b>{pool.name}</b>
        {pool.status === "Errored" && (
          <>
            <br />
            <Chip
              className="u-no-margin"
              appearance="negative"
              value="Errored"
              lead="status"
              isReadOnly
            />
          </>
        )}
      </p>

      <p>
        {volumeCount} {pluralize("volume", volumeCount)}
      </p>
      <StoragePoolSize pool={pool} hasMeterBar displayPercentage />
    </div>
  );
};

export default StoragePoolDetails;
