import type { FC } from "react";
import { useParams } from "react-router-dom";
import { Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import NotificationRow from "components/NotificationRow";
import StorageVolumeHeader from "pages/storage/StorageVolumeHeader";
import StorageVolumeOverview from "pages/storage/StorageVolumeOverview";
import EditStorageVolume from "pages/storage/forms/EditStorageVolume";
import TabLinks from "components/TabLinks";
import CustomLayout from "components/CustomLayout";
import StorageVolumeSnapshots from "./StorageVolumeSnapshots";
import { useStorageVolume } from "context/useVolumes";

const tabs: string[] = ["Overview", "Configuration", "Snapshots"];

const StorageVolumeDetail: FC = () => {
  const notify = useNotify();
  const {
    pool,
    project,
    activeTab,
    type,
    volume: volumeName,
  } = useParams<{
    pool: string;
    project: string;
    activeTab?: string;
    type: string;
    volume: string;
  }>();

  if (!pool) {
    return <>Missing storage pool</>;
  }
  if (!project) {
    return <>Missing project</>;
  }
  if (!type) {
    return <>Missing type</>;
  }
  if (!volumeName) {
    return <>Missing volume</>;
  }

  const {
    data: volume,
    error,
    isLoading,
  } = useStorageVolume(pool, project, type, volumeName);

  if (error) {
    notify.failure("Loading storage volume failed", error);
  }

  if (isLoading) {
    return <Loader isMainComponent />;
  } else if (!volume) {
    return <>Loading storage volume failed</>;
  }

  return (
    <CustomLayout
      header={<StorageVolumeHeader volume={volume} project={project} />}
      contentClassName="detail-page sotrage-volume-form u-no-padding--bottom"
    >
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/project/${project}/storage/pool/${pool}/volumes/${type}/${volume.name}`}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <StorageVolumeOverview volume={volume} project={project} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="configuration">
            <EditStorageVolume volume={volume} />
          </div>
        )}

        {activeTab === "snapshots" && (
          <div role="tabpanel" aria-labelledby="snapshots">
            <StorageVolumeSnapshots volume={volume} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StorageVolumeDetail;
