import type { FC } from "react";
import { Link } from "react-router-dom";
import { Icon, List, Spinner } from "@canonical/react-components";
import ExplanationTooltip from "components/ExplanationTooltip";
import { useCurrentProject } from "context/useCurrentProject";
import { useProjects } from "context/useProjects";
import { useStoragePools } from "context/useStoragePools";
import StoragePoolDetails from "pages/overview/StoragePoolDetails";
import type { LxdStoragePool } from "types/storage";
import { useServerEntitlements } from "util/entitlements/server";
import { ROOT_PATH } from "util/rootPath";
import { getVolumesUsedByPool } from "util/storagePool";
import { getDefaultProject } from "util/loginProject";
import { pluralize } from "util/helpers";
import CardEmptyState from "./CardEmptyState";
import { renderOverviewCard } from "util/overview";

const StorageCard: FC = () => {
  const { data: pools = [], error, isLoading } = useStoragePools();
  const { projectName, isAllProjects } = useCurrentProject();
  const { data: projects = [] } = useProjects();
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

  // Storage has no all-projects section, so fall back to a real project.
  const storageProject = isAllProjects
    ? (projects.find((p) => p.name === getDefaultProject(projects))?.name ??
      "default")
    : projectName;
  const storagePoolsUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(storageProject)}/storage/pools`;
  const footerLink = <Link to={storagePoolsUrl}>Storage pools list</Link>;

  if (isLoading) {
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <Spinner className="u-loader" text="Loading storage pools..." />,
      footerLink,
    );
  }

  if (error) {
    return renderOverviewCard(
      cardClassName,
      cardTitle,
      <div className="error-message">
        <Icon name="error" className="margin-right--large" /> Error while
        loading storage pools: {error.message}
      </div>,
      footerLink,
    );
  }

  if (pools.length === 0) {
    const canCreatePool = canCreateStoragePools();

    return renderOverviewCard(
      cardClassName,
      cardTitle,
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
      />,
      footerLink,
    );
  }

  return renderOverviewCard(
    cardClassName,
    cardTitle,
    <>
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
          <StoragePoolDetails
            pool={pool}
            project={storageProject}
            key={pool.name}
          />
        ))}
      </div>
    </>,
    footerLink,
  );
};

export default StorageCard;
