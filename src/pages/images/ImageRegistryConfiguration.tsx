import type { FC } from "react";
import { Col, Row } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import type { LxdImageRegistry } from "types/image";
import { isImageRegistryPublic } from "util/imageRegistries";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  imageRegistry: LxdImageRegistry;
}

const ImageRegistryConfiguration: FC<Props> = ({ imageRegistry }) => {
  return (
    <>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">Name</th>
                <td>{imageRegistry.name}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Description</th>
                <td>{imageRegistry.description || "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Protocol</th>
                <td>{imageRegistry.protocol}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Built-in</th>
                <td>{imageRegistry.builtin ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>

      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">Configuration</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">Server</th>
                <td>{imageRegistry.config?.url || "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Public</th>
                <td>{isImageRegistryPublic(imageRegistry) ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Cluster</th>
                <td>
                  {imageRegistry.config?.cluster ? (
                    <ResourceLink
                      type="cluster-link"
                      value={imageRegistry.config?.cluster || ""}
                      to={`${ROOT_PATH}/ui/cluster/links`}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Source project</th>
                <td>{imageRegistry.config?.source_project || "-"}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </>
  );
};

export default ImageRegistryConfiguration;
