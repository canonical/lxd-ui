import type { FC } from "react";
import { useEffect } from "react";
import { Col, Row, useListener } from "@canonical/react-components";
import StorageUsedBy from "pages/storage/StorageUsedBy";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { LxdStorageVolume } from "types/storage";
import { isoTimeToString } from "util/helpers";
import StorageVolumeSize from "pages/storage/StorageVolumeSize";
import { renderContentType, renderVolumeType } from "util/storageVolume";
import { useSettings } from "context/useSettings";
import ResourceLink from "components/ResourceLink";

interface Props {
  project: string;
  volume: LxdStorageVolume;
}

const StorageVolumeOverview: FC<Props> = ({ project, volume }) => {
  const updateContentHeight = () => {
    updateMaxHeight("storage-overview-tab");
  };
  useEffect(updateContentHeight, [volume]);
  useListener(window, updateContentHeight, "resize", true);
  const { data: settings } = useSettings();

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
                <td>{volume.name}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Type</th>
                <td>{renderVolumeType(volume)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Content type</th>
                <td>{renderContentType(volume)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Description</th>
                <td>{volume.description ? volume.description : "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Cluster member</th>
                <td>
                  {settings?.environment?.server_clustered &&
                  volume.location ? (
                    <ResourceLink
                      type="cluster-member"
                      value={volume.location}
                      to={`/ui/cluster/member/${encodeURIComponent(volume.location)}`}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Pool</th>
                <td>
                  <ResourceLink
                    type="pool"
                    value={volume.pool}
                    to={`/ui/project/${encodeURIComponent(volume.project)}/storage/pool/${encodeURIComponent(volume.pool)}`}
                  />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Date created</th>
                <td>{isoTimeToString(volume.created_at)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Size</th>
                <td>
                  <StorageVolumeSize volume={volume} />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Custom config</th>
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
