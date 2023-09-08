import React, { FC } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStoragePool } from "api/storage-pools";
import StorageSize from "pages/storage/StorageSize";
import StorageUsedBy from "pages/storage/StorageUsedBy";
import StorageDetailHeader from "pages/storage/StorageDetailHeader";
import NotificationRow from "components/NotificationRow";

const StorageDetail: FC = () => {
  const notify = useNotify();
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: storagePool,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, project, name],
    queryFn: () => fetchStoragePool(name, project),
  });

  if (error) {
    notify.failure("Loading storage details failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage details..." />;
  } else if (!storagePool) {
    return <>Loading storage details failed</>;
  }

  return (
    <main className="l-main">
      <div className="p-panel instance-detail-page">
        <StorageDetailHeader
          name={name}
          storagePool={storagePool}
          project={project}
        />
        <div className="p-panel__content">
          <NotificationRow />
          <Row>
            <table className="storage-detail-table">
              <tbody>
                <tr>
                  <th className="u-text--muted">Name</th>
                  <td>{storagePool.name}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Status</th>
                  <td>{storagePool.status}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Size</th>
                  <td>
                    <StorageSize storage={storagePool} />
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Source</th>
                  <td>{storagePool.config?.source ?? "-"}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Description</th>
                  <td>
                    {storagePool.description ? storagePool.description : "-"}
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Driver</th>
                  <td>{storagePool.driver}</td>
                </tr>
              </tbody>
            </table>
            <h2 className="p-heading--5">Used by</h2>
            <StorageUsedBy storage={storagePool} project={project} />
          </Row>
        </div>
      </div>
    </main>
  );
};

export default StorageDetail;
