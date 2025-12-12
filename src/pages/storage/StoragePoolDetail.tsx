import type { FC } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon, Row, Spinner, CustomLayout } from "@canonical/react-components";
import StoragePoolHeader from "pages/storage/StoragePoolHeader";
import NotificationRow from "components/NotificationRow";
import StoragePoolOverview from "pages/storage/StoragePoolOverview";
import EditStoragePool from "pages/storage/EditStoragePool";
import TabLinks from "components/TabLinks";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useStoragePool } from "context/useStoragePools";
import classnames from "classnames";
import { cephObject, isBucketCompatibleDriver } from "util/storageOptions";
import NotFound from "components/NotFound";

const StoragePoolDetail: FC = () => {
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const { data: pool, error, isLoading } = useStoragePool(name);
  const isVolumeCompatible = pool?.driver !== cephObject;
  const isBucketCompatible = isBucketCompatibleDriver(pool?.driver || "");

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  } else if (!pool) {
    return (
      <NotFound
        entityType="pool"
        entityName={name}
        errorMessage={error?.message}
      />
    );
  }

  const tabs: (string | TabLink)[] = [
    "Overview",
    "Configuration",
    {
      component: () => {
        return (
          <Link
            to={
              isVolumeCompatible
                ? `/ui/project/${encodeURIComponent(project)}/storage/volumes?pool=${encodeURIComponent(pool.name)}`
                : "#"
            }
            className={classnames("p-tabs__link", {
              "is-disabled": !isVolumeCompatible,
            })}
            title={
              isVolumeCompatible
                ? "Volumes"
                : "Volumes are not supported on this pool"
            }
          >
            Volumes <Icon name="external-link" />
          </Link>
        );
      },
      label: "Volumes",
    },
    {
      component: () => (
        <Link
          to={
            isBucketCompatible
              ? `/ui/project/${encodeURIComponent(project)}/storage/buckets?pool=${encodeURIComponent(pool.name)}`
              : "#"
          }
          className={classnames("p-tabs__link", {
            "is-disabled": !isBucketCompatible,
          })}
          title={
            isBucketCompatible
              ? "Buckets"
              : "Buckets are not supported on this pool"
          }
        >
          Buckets <Icon name="external-link" />
        </Link>
      ),
      label: "Buckets",
    },
  ];

  return (
    <CustomLayout
      header={<StoragePoolHeader name={name} pool={pool} project={project} />}
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(name)}`}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <StoragePoolOverview pool={pool} project={project} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="configuration">
            <EditStoragePool pool={pool} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StoragePoolDetail;
