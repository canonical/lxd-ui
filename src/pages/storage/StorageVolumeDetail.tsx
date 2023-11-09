import React, { FC } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStorageVolume } from "api/storage-pools";
import NotificationRow from "components/NotificationRow";
import StorageVolumeHeader from "pages/storage/StorageVolumeHeader";
import StorageVolumeOverview from "pages/storage/StorageVolumeOverview";
import StorageVolumeEdit from "pages/storage/forms/StorageVolumeEdit";
import TabLinks from "components/TabLinks";

const tabs: string[] = ["Overview", "Configuration"];

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
  } = useQuery({
    queryKey: [queryKeys.storage, pool, project, type, volumeName],
    queryFn: () => fetchStorageVolume(pool, project, type, volumeName),
  });

  if (error) {
    notify.failure("Loading storage volume failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage volume..." />;
  } else if (!volume) {
    return <>Loading storage volume failed</>;
  }

  return (
    <main className="l-main">
      <div className="p-panel">
        <StorageVolumeHeader volume={volume} project={project} />
        <div className="p-panel__content storage-volume-form">
          <NotificationRow />
          <Row>
            <TabLinks
              tabs={tabs}
              activeTab={activeTab}
              tabUrl={`/ui/project/${project}/storage/detail/${pool}/${type}/${volume.name}`}
            />

            {!activeTab && (
              <div role="tabpanel" aria-labelledby="overview">
                <StorageVolumeOverview volume={volume} project={project} />
              </div>
            )}

            {activeTab === "configuration" && (
              <div role="tabpanel" aria-labelledby="configuration">
                <StorageVolumeEdit volume={volume} />
              </div>
            )}
          </Row>
        </div>
      </div>
    </main>
  );
};

export default StorageVolumeDetail;
