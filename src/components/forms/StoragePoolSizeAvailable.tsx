import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import { Icon } from "@canonical/react-components";
import { useStoragePoolResourceLimit } from "context/useStoragePoolResourceLimit";
import type { LxdStoragePool } from "types/storage";
import { ResourceLimitIcon } from "components/ResourceLimitIcon";
import { isClusterLocalDriver } from "util/storagePool";

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
            <Icon
              name="information"
              className="help-link-icon"
              title={helpIconText}
            />
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
