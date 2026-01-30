import type { FC } from "react";
import { useEffect } from "react";
import { isoTimeToString } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import { Col, Row, useListener, useNotify } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { updateMaxHeight } from "util/updateMaxHeight";
import InstanceOverviewProfiles from "./InstanceOverviewProfiles";
import InstanceOverviewMetrics from "./InstanceOverviewMetrics";
import InstanceIps from "pages/instances/InstanceIps";
import { useIsClustered } from "context/useIsClustered";
import NotificationRow from "components/NotificationRow";
import DeviceListTable from "components/DeviceListTable";
import NetworkListTable from "components/NetworkListTable";
import type { LxdDevices } from "types/device";
import ResourceLink from "components/ResourceLink";
import { getIpAddresses } from "util/networks";
import { getImageLink, getInstanceType } from "util/instances";
import ClusterMemberRichChip from "pages/cluster/ClusterMemberRichChip";

interface Props {
  instance: LxdInstance;
}

const InstanceOverview: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const isClustered = useIsClustered();

  const onFailure = (title: string, e: unknown) => {
    notify.failure(title, e);
  };

  const updateContentHeight = () => {
    updateMaxHeight("instance-overview-tab");
  };
  useEffect(updateContentHeight, [notify.notification?.message]);
  useListener(window, updateContentHeight, "resize", true);

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
                <th className="u-text--muted">Base image</th>
                <td>{getImageLink(instance)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Description</th>
                <td>{instance.description ? instance.description : "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Type</th>
                <td>{getInstanceType(instance)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">IPv4</th>
                <td key={getIpAddresses(instance, "inet").length}>
                  <InstanceIps instance={instance} family="inet" />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">IPv6</th>
                <td key={getIpAddresses(instance, "inet6").length}>
                  <InstanceIps instance={instance} family="inet6" />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">Architecture</th>
                <td>{instance.architecture}</td>
              </tr>
              {isClustered && (
                <>
                  <tr>
                    <th className="u-text--muted">Cluster member</th>
                    <td>
                      {instance.location ? (
                        <ClusterMemberRichChip
                          clusterMember={instance.location}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Placement group</th>
                    <td>
                      {instance.expanded_config["placement.group"] ? (
                        <ResourceLink
                          type="placement-group"
                          value={instance.expanded_config["placement.group"]}
                          to={`${ROOT_PATH}/ui/project/${instance.project}/placement-groups`}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                </>
              )}
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
          <NetworkListTable
            devices={instance.expanded_devices as LxdDevices}
            instance={instance}
            onFailure={onFailure}
          />
        </Col>
      </Row>
      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--5">Devices</h2>
        </Col>
        <Col size={7}>
          <DeviceListTable
            configBaseURL={`${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/configuration`}
            devices={instance.expanded_devices as LxdDevices}
          />
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
