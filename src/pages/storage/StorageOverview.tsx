import React, { FC, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Col, Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import { fetchStoragePool } from "api/storage-pools";
import StorageSize from "pages/storage/StorageSize";
import StorageUsedBy from "pages/storage/StorageUsedBy";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";

interface Props {
  name: string;
  project: string;
}

const StorageOverview: FC<Props> = ({ name, project }) => {
  const notify = useNotify();

  const {
    data: pool,
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
  } else if (!pool) {
    return <>Loading storage details failed</>;
  }

  const updateContentHeight = () => {
    updateMaxHeight("storage-overview-tab");
  };
  useEffect(updateContentHeight, [project, pool]);
  useEventListener("resize", updateContentHeight);

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
                <td>{pool.name}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Status</th>
                <td>{pool.status}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Size</th>
                <td>
                  <StorageSize storage={pool} />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Source</th>
                <td>{pool.config?.source ?? "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{pool.description ? pool.description : "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Driver</th>
                <td>{pool.driver}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">
            Used by ({pool.used_by?.length ?? 0})
          </h2>
        </Col>
        <Col size={7}>
          <StorageUsedBy storage={pool} project={project} />
        </Col>
      </Row>
    </div>
  );
};

export default StorageOverview;
