import type { FC } from "react";
import { useParams } from "react-router-dom";
import { Row, CustomLayout, Spinner } from "@canonical/react-components";
import { useBucket } from "context/useBuckets";
import StorageBucketHeader from "./StorageBucketHeader";
import StorageBucketKeys from "./StorageBucketKeys";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateStorageBucketKeyPanel from "./panels/CreateStorageBucketKeyPanel";
import EditStorageBucketPanel from "./panels/EditStorageBucketPanel";
import EditStorageBucketKeyPanel from "./panels/EditStorageBucketKeyPanel";
import NotFound from "components/NotFound";

const StorageBucketDetail: FC = () => {
  const {
    pool,
    project,
    member,
    bucket: bucketName,
  } = useParams<{
    bucket: string;
    pool: string;
    project: string;
    member?: string;
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
  } = useBucket(bucketName, pool, project, member);

  const panelParams = usePanelParams();

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  } else if (!bucket) {
    return (
      <NotFound
        entityType="bucket"
        entityName={bucketName}
        errorMessage={error?.message}
      />
    );
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
      {panelParams.panel === panels.editStorageBucketKey && (
        <EditStorageBucketKeyPanel bucket={bucket} />
      )}
    </>
  );
};

export default StorageBucketDetail;
