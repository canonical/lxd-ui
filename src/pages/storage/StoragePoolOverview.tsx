import { FC, useEffect } from "react";
import { Col, Row } from "@canonical/react-components";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import StorageUsedBy from "pages/storage/StorageUsedBy";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { LxdStoragePool } from "types/storage";

interface Props {
  pool: LxdStoragePool;
  project: string;
}

const StoragePoolOverview: FC<Props> = ({ pool, project }) => {
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
                <th className="u-text--muted">Name</th>
                <td>{pool.name}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Status</th>
                <td>{pool.status}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Size</th>
                <td>
                  <StoragePoolSize pool={pool} hasMeterBar />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Source</th>
                <td>{pool.config?.source ?? "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Description</th>
                <td>{pool.description ? pool.description : "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Driver</th>
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

export default StoragePoolOverview;
