import type { FC } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon, Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import StoragePoolHeader from "pages/storage/StoragePoolHeader";
import NotificationRow from "components/NotificationRow";
import StoragePoolOverview from "pages/storage/StoragePoolOverview";
import CustomLayout from "components/CustomLayout";
import EditStoragePool from "pages/storage/EditStoragePool";
import { useClusterMembers } from "context/useClusterMembers";
import TabLinks from "components/TabLinks";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useStoragePool } from "context/useStoragePools";
import classnames from "classnames";
import { cephObject, isBucketCompatibleDriver } from "util/storageOptions";

const StoragePoolDetail: FC = () => {
  const notify = useNotify();
  const { data: clusterMembers = [] } = useClusterMembers();
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

  const member = clusterMembers[0]?.server_name ?? undefined;
  const { data: pool, error, isLoading } = useStoragePool(name, member);
  const isVolumeCompatible = pool?.driver !== cephObject;
  const isBucketCompatible = isBucketCompatibleDriver(pool?.driver || "");

  if (error) {
    notify.failure("Loading storage details failed", error);
  }

  if (isLoading) {
    return <Loader isMainComponent />;
  } else if (!pool) {
    return <>Loading storage details failed</>;
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
