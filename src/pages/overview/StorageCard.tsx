import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, List, Spinner } from "@canonical/react-components";
import ExplanationTooltip from "components/ExplanationTooltip";
import { useAuth } from "context/auth";
import { useStoragePools } from "context/useStoragePools";
import StoragePoolDetails from "pages/overview/StoragePoolDetails";
import type { LxdStoragePool } from "types/storage";
import { useServerEntitlements } from "util/entitlements/server";
import { ROOT_PATH } from "util/rootPath";
import { getVolumesUsedByPool } from "util/storagePool";
import { pluralize } from "util/helpers";
import CardEmptyState from "./CardEmptyState";

const StorageCard: FC = () => {
  const { data: pools = [], error, isLoading } = useStoragePools();
  const { defaultProject } = useAuth();
  const { canCreateStoragePools } = useServerEntitlements();

  const totalVolumeCount = pools.reduce(
    (count, pool: LxdStoragePool) => count + getVolumesUsedByPool(pool).length,
    0,
  );

  const cardClassName = "overview-card storage";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <Icon name="storage-pool" /> Storage
      </span>
      <ExplanationTooltip
        explanation={
          <>
            Storage pools host instance and image data. <br />
            Storage volumes provide storage for instances.
          </>
        }
        docPath="/storage"
      />
    </>
  );

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading storage pools..." />
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

  const storagePoolsUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(defaultProject)}/storage/pools`;

  if (pools.length === 0) {
    const canCreatePool = canCreateStoragePools();

    return (
      <Card className={cardClassName} title={cardTitle}>
        <CardEmptyState
          title="No storage pools found"
          subtitle={
            canCreatePool && (
              <>
                Create a storage pool on the{" "}
                <Link to={storagePoolsUrl}>storage pools list</Link> page
              </>
            )
          }
          footerLink={<Link to={storagePoolsUrl}>Storage pools list</Link>}
        />
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <List
        inline
        middot
        items={[
          `${pools.length} ${pluralize("pool", pools.length)}`,
          `${totalVolumeCount} ${pluralize("volume", totalVolumeCount)}`,
        ]}
      />
      <div className="storage-pools-container">
        {pools.map((pool) => (
          <StoragePoolDetails pool={pool} key={pool.name} />
        ))}
      </div>
      <div className="card-footer">
        <Link to={storagePoolsUrl}>Storage pools list</Link>
      </div>
    </Card>
  );
};

export default StorageCard;
