import type { FC } from "react";
import { useParams } from "react-router-dom";
import { Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import CustomLayout from "components/CustomLayout";
import { useStorageBucket } from "context/useBuckets";
import StorageBucketHeader from "./StorageBucketHeader";
import StorageBucketKeys from "./StorageBucketKeys";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateStorageBucketKeyPanel from "./panels/CreateStorageBucketKeyPanel";
import EditStorageBucketPanel from "./panels/EditStorageBucketPanel";

const StorageBucketDetail: FC = () => {
  const notify = useNotify();
  const {
    pool,
    project,
    member,
    bucket: bucketName,
  } = useParams<{
    pool: string;
    project: string;
    member?: string;
    activeTab?: string;
    bucket: string;
  }>();

  if (!pool) {
    return <>Missing storage pool</>;
  }
  if (!project) {
    return <>Missing project</>;
  }
  if (!bucketName) {
    return <>Missing bucket</>;
  }

  const {
    data: bucket,
    error,
    isLoading,
  } = useStorageBucket(bucketName, pool, project, member);
  const panelParams = usePanelParams();

  if (error) {
    notify.failure("Loading storage bucket failed", error);
  }

  if (isLoading) {
    return <Loader isMainComponent />;
  } else if (!bucket) {
    return <>Loading storage bucket failed</>;
  }

  return (
    <>
      <CustomLayout
        header={<StorageBucketHeader bucket={bucket} project={project} />}
        contentClassName="detail-page u-no-padding--bottom"
      >
        <Row>
          <StorageBucketKeys bucket={bucket} />
        </Row>
      </CustomLayout>

      {panelParams.panel === panels.editStorageBucket && (
        <EditStorageBucketPanel bucket={bucket} />
      )}
      {panelParams.panel === panels.createStorageBucketKey && (
        <CreateStorageBucketKeyPanel bucket={bucket} />
      )}
    </>
  );
};

export default StorageBucketDetail;
