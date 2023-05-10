import React, { FC } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import { Row } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStoragePool } from "api/storage-pools";
import StorageSize from "pages/storage/StorageSize";
import StorageUsedBy from "pages/storage/StorageUsedBy";

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
    data: storage,
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
  } else if (!storage) {
    return <>Loading storage details failed</>;
  }

  return (
    <BaseLayout title={`Storage details for ${name}`}>
      <NotificationRow />
      <Row>
        <table className="storage-detail-table">
          <tbody>
            <tr>
              <th className="u-text--muted">Name</th>
              <td>{storage.name}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Status</th>
              <td>{storage.status}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Size</th>
              <td>
                <StorageSize storage={storage} />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Source</th>
              <td>{storage.config?.source ?? "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Description</th>
              <td>{storage.description ? storage.description : "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Driver</th>
              <td>{storage.driver}</td>
            </tr>
          </tbody>
        </table>
        <h2 className="p-heading--5">Used by</h2>
        <StorageUsedBy storage={storage} project={project} />
      </Row>
    </BaseLayout>
  );
};

export default StorageDetail;
