import { FC, useEffect } from "react";
import { isoTimeToString } from "util/helpers";
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
                <th className="p-muted-heading">Base image</th>
                <td>{instance.config["image.description"] ?? "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{instance.description ? instance.description : "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Type</th>
                <td>
                  {
                    instanceCreationTypes.filter(
                      (item) => item.value === instance.type,
                    )[0].label
                  }
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">IPv4</th>
                <td>
                  <InstanceIps instance={instance} family="inet" />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">IPv6</th>
                <td>
                  <InstanceIps instance={instance} family="inet6" />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Architecture</th>
                <td>{instance.architecture}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Location</th>
                <td>
                  {settings?.environment?.server_clustered
                    ? instance.location
                    : "-"}
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">PID</th>
                <td>{pid}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Date created</th>
                <td>{isoTimeToString(instance.created_at)}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Last used</th>
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
