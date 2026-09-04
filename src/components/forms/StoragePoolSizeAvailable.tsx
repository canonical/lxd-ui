import type { FC } from "react";
import { humanFileSize } from "util/helpers";

import { useStoragePoolResourceLimit } from "context/useStoragePoolResourceLimit";
import type { LxdStoragePool } from "types/storage";
import { ResourceLimitIcon } from "components/ResourceLimitIcon";
import { isClusterLocalDriver } from "util/storagePool";
import DsIcon from "components/DsIcon";

interface Props {
  pool?: LxdStoragePool;
  clusterMember?: string;
}

const StoragePoolSizeAvailable: FC<Props> = ({ pool, clusterMember }) => {
  const resourceLimit = useStoragePoolResourceLimit(pool, clusterMember);
  if (!resourceLimit) {
    return null;
  }
  const { min: minSize, max: maxSize, sourceName } = resourceLimit;

  const showHelpIcon = minSize !== maxSize;
  const helpIconText =
    "The available space depends on the target cluster member.";

  return (
    <>
      Available space:{" "}
      <b>
        {humanFileSize(minSize)}
        {minSize !== maxSize && ` - ${humanFileSize(maxSize)}`}
        {showHelpIcon && (
          <>
            {" "}
            <span title={helpIconText}>
              <DsIcon icon="information" className="help-link-icon" />
            </span>
          </>
        )}
      </b>
      {sourceName && isClusterLocalDriver(pool?.driver ?? "") && (
        <>
          {" "}
          <ResourceLimitIcon source={sourceName} sourceType="cluster-member" />
        </>
      )}
      {"."}
    </>
  );
};
export default StoragePoolSizeAvailable;
