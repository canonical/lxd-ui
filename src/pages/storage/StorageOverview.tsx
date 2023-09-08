import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Col, Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStoragePool } from "api/storage-pools";
import StorageSize from "pages/storage/StorageSize";
import StorageUsedBy from "pages/storage/StorageUsedBy";

interface Props {
  name: string;
  project: string;
}

const StorageOverview: FC<Props> = ({ name, project }) => {
  const notify = useNotify();

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
    <div className="storage-overview-tab">
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">Name</th>
                <td>{storagePool.name}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Status</th>
                <td>{storagePool.status}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Size</th>
                <td>
                  <StorageSize storage={storagePool} />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Source</th>
                <td>{storagePool.config?.source ?? "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>
                  {storagePool.description ? storagePool.description : "-"}
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Driver</th>
                <td>{storagePool.driver}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">
            Used by ({storagePool.used_by?.length ?? 0})
          </h2>
        </Col>
        <Col size={7}>
          <StorageUsedBy storage={storagePool} project={project} />
        </Col>
      </Row>
    </div>
  );
};

export default StorageOverview;
