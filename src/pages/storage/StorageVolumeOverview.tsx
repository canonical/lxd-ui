import { FC, useEffect } from "react";
import { Col, Row } from "@canonical/react-components";
import StorageUsedBy from "pages/storage/StorageUsedBy";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { LxdStorageVolume } from "types/storage";
import { isoTimeToString } from "util/helpers";
import StorageVolumeSize from "pages/storage/StorageVolumeSize";
import { renderContentType, renderVolumeType } from "util/storageVolume";
import { Link } from "react-router-dom";

interface Props {
  project: string;
  volume: LxdStorageVolume;
}

const StorageVolumeOverview: FC<Props> = ({ project, volume }) => {
  const updateContentHeight = () => {
    updateMaxHeight("storage-overview-tab");
  };
  useEffect(updateContentHeight, [volume]);
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
                <td>{volume.name}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Type</th>
                <td>{renderVolumeType(volume)}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Content type</th>
                <td>{renderContentType(volume)}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{volume.description ? volume.description : "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Location</th>
                <td>{volume.location}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Pool</th>
                <td>
                  <Link
                    to={`/ui/project/${project}/storage/pool/${volume.pool}`}
                  >
                    {volume.pool}
                  </Link>
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Date created</th>
                <td>{isoTimeToString(volume.created_at)}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Size</th>
                <td>
                  <StorageVolumeSize volume={volume} />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Custom config</th>
                <td>
                  {Object.entries(volume.config).length === 0 ? (
                    "-"
                  ) : (
                    <table>
                      <tbody>
                        {Object.entries(volume.config).map(
                          ([key, value], id) => {
                            return (
                              <tr key={id}>
                                <th className="u-text--muted">{key}</th>
                                <td>{value}</td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">
            Used by ({volume.used_by?.length ?? 0})
          </h2>
        </Col>
        <Col size={7}>
          <StorageUsedBy storage={volume} project={project} />
        </Col>
      </Row>
    </div>
  );
};

export default StorageVolumeOverview;
