import { FC, useEffect } from "react";
import { getRootPool, isoTimeToString } from "util/helpers";
import { Col, Row, useNotify } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { instanceCreationTypes } from "util/instanceOptions";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import InstanceOverviewNetworks from "./InstanceOverviewNetworks";
import InstanceOverviewProfiles from "./InstanceOverviewProfiles";
import InstanceOverviewMetrics from "./InstanceOverviewMetrics";
import InstanceIps from "pages/instances/InstanceIps";
import { useSettings } from "context/useSettings";
import NotificationRow from "components/NotificationRow";
import InstanceOverviewDevices from "./InstanceOverviewDevices";
import { Link } from "react-router-dom";

interface Props {
  instance: LxdInstance;
}

const InstanceOverview: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const { data: settings } = useSettings();

  const onFailure = (title: string, e: unknown) => {
    notify.failure(title, e);
  };

  const updateContentHeight = () => {
    updateMaxHeight("instance-overview-tab");
  };
  useEffect(updateContentHeight, [notify.notification?.message]);
  useEventListener("resize", updateContentHeight);

  const pid =
    !instance.state || instance.state.pid === 0 ? "-" : instance.state.pid;

  const rootPool = getRootPool(instance);

  return (
    <div className="instance-overview-tab">
      <NotificationRow />
      <Row className="general">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">Base image</th>
                <td>{instance.config["image.description"] ?? "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Description</th>
                <td>{instance.description ? instance.description : "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Type</th>
                <td>
                  {
                    instanceCreationTypes.filter(
                      (item) => item.value === instance.type,
                    )[0].label
                  }
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">IPv4</th>
                <td>
                  <InstanceIps instance={instance} family="inet" />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">IPv6</th>
                <td>
                  <InstanceIps instance={instance} family="inet6" />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Architecture</th>
                <td>{instance.architecture}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Cluster member</th>
                <td>
                  {settings?.environment?.server_clustered
                    ? instance.location
                    : "-"}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Root storage pool</th>
                <td>
                  <Link
                    to={`/ui/project/${instance.project}/storage/pool/${rootPool}`}
                  >
                    {rootPool}
                  </Link>
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">PID</th>
                <td>{pid}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Date created</th>
                <td>{isoTimeToString(instance.created_at)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Last used</th>
                <td>{isoTimeToString(instance.last_used_at)}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="usage">
        <Col size={3}>
          <h2 className="p-heading--5">Usage</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewMetrics instance={instance} onFailure={onFailure} />
        </Col>
      </Row>
      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--5">Networks</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewNetworks instance={instance} onFailure={onFailure} />
        </Col>
      </Row>
      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--5">Devices</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewDevices instance={instance} />
        </Col>
      </Row>
      <Row className="profiles">
        <Col size={3}>
          <h2 className="p-heading--5">Profiles</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewProfiles instance={instance} onFailure={onFailure} />
        </Col>
      </Row>
    </div>
  );
};

export default InstanceOverview;
