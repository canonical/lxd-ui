import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Spinner } from "@canonical/react-components";
import { useStoragePools } from "context/useStoragePools";
import StoragePoolDetails from "pages/overview/StoragePoolDetails";
import { type LxdStoragePool } from "types/storage";
import { ROOT_PATH } from "util/rootPath";
import { getVolumesUsedByPool } from "util/storagePool";
import { pluralize } from "util/helpers";

const StorageCard: FC = () => {
  const { data: pools = [], error, isLoading } = useStoragePools();

  const poolsWithVolumeCount = pools.map((pool: LxdStoragePool) => {
    return {
      name: pool.name,
      volumeCount: getVolumesUsedByPool(pool).length,
    };
  });
  const totalVolumeCount = poolsWithVolumeCount.reduce(
    (acc, pool) => acc + pool.volumeCount,
    0,
  );

  const cardClassName = "overview-card storage";
  const cardTitle = (
    <>
      <Icon name="storage-pool" /> Storage
    </>
  );

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <div className="error-message">
          <Icon name="error" className="margin-right--large" /> Error while
          loading storage pools: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      {!isLoading && !error && (
        <>
          <p>
            {pools.length} {pluralize("pool", pools.length)}&nbsp;|&nbsp;
            {totalVolumeCount} {pluralize("volume", totalVolumeCount)}
          </p>
          <div className="storage-pools-container">
            {pools.map((pool) => (
              <StoragePoolDetails
                pool={pool}
                volumeCount={
                  poolsWithVolumeCount.find((p) => p.name === pool.name)
                    ?.volumeCount || 0
                }
                key={pool.name}
              />
            ))}
          </div>
          <div className="card-footer">
            <Link to={`${ROOT_PATH}/ui/project/default/storage/pools`}>
              See more
            </Link>
          </div>
        </>
      )}
    </Card>
  );
};

export default StorageCard;
