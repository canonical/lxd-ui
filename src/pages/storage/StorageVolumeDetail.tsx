import type { FC } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import StorageVolumeHeader from "pages/storage/StorageVolumeHeader";
import StorageVolumeOverview from "pages/storage/StorageVolumeOverview";
import EditStorageVolume from "pages/storage/forms/EditStorageVolume";
import TabLinks from "components/TabLinks";
import StorageVolumeSnapshots from "./StorageVolumeSnapshots";
import { useStorageVolume } from "context/useVolumes";
import { linkForVolumeDetail } from "util/storageVolume";

const tabs: string[] = ["Overview", "Configuration", "Snapshots"];

const StorageVolumeDetail: FC = () => {
  const notify = useNotify();
  const {
    pool,
    project,
    member,
    activeTab,
    type,
    volume: volumeName,
  } = useParams<{
    pool: string;
    project: string;
    member?: string;
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
  } = useStorageVolume(pool, project, type, volumeName, member);

  if (error) {
    notify.failure("Loading storage volume failed", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  } else if (!volume) {
    return <>Loading storage volume failed</>;
  }

  return (
    <CustomLayout
      header={<StorageVolumeHeader volume={volume} project={project} />}
      contentClassName="detail-page storage-volume-form u-no-padding--bottom"
    >
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={linkForVolumeDetail(volume)}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <StorageVolumeOverview volume={volume} />
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
