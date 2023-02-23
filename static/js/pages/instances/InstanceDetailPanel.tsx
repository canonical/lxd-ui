import React, { FC, useState } from "react";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenVgaBtn from "./actions/OpenVgaBtn";
import { Button, Col, List, Row } from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import { isNicDevice } from "util/devices";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import { Link } from "react-router-dom";
import InstanceStatusIcon from "./InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { useSharedNotify } from "../../context/sharedNotify";
import Aside from "components/Aside";
import usePanelParams from "util/usePanelParams";

const RECENT_SNAPSHOT_LIMIT = 5;

const InstanceDetailPanel: FC = () => {
  const { sharedNotify: instanceListNotify } = useSharedNotify();
  const panelParams = usePanelParams();
  const [isStarting, setStarting] = useState<boolean>(false);
  const [isStopping, setStopping] = useState<boolean>(false);

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, panelParams.instance],
    queryFn: () =>
      fetchInstance(panelParams.instance ?? "", panelParams.project),
    enabled: panelParams.instance !== null,
  });

  if (error) {
    instanceListNotify?.failure("Could not load instance details.", error);
  }

  const [ip4DisplayCount, setIp4DisplayCount] = useState(5);
  const [ip6DisplayCount, setIp6DisplayCount] = useState(5);

  const getIpAddresses = (family: string) => {
    return (
      instance?.state?.network?.eth0?.addresses
        .filter((item) => item.family === family)
        .map((item) => {
          return (
            <Row key={item.address}>
              <Col size={6} className="u-truncate" title={item.address}>
                {item.address}
              </Col>
            </Row>
          );
        }) ?? []
    );
  };
  const ip4Addresses = getIpAddresses("inet");
  const ip6Addresses = getIpAddresses("inet6");
  const manageSnapshotLabel =
    instance?.snapshots && instance.snapshots.length > RECENT_SNAPSHOT_LIMIT
      ? "View all"
      : "Manage";

  return (
    <Aside width="narrow" pinned>
      {isLoading && <Loader />}
      {!isLoading && !instance && <>Could not load instance details.</>}
      {instance && instanceListNotify && (
        <div className="p-panel p-instance-detail-panel">
          <div className="p-panel__header p-instance-detail-panel--header">
            <div className="p-panel__title-wrapper">
              <div className="p-panel__title">
                <span className="u-no-margin--bottom">Instance summary</span>
                <span
                  title="View more"
                  className="u-no-margin--bottom u-truncate"
                >
                  <Link
                    to={`/ui/${instance.project}/instances/${instance.name}`}
                  >
                    View more
                  </Link>
                </span>
              </div>
              <div className="p-panel__controls">
                <Button
                  appearance="base"
                  className="u-no-margin--bottom"
                  hasIcon
                  onClick={panelParams.clear}
                >
                  <i className="p-icon--close"></i>
                </Button>
              </div>
            </div>
            <hr className="p-section-separator" />
          </div>
          <div className="p-panel__content p-instance-detail-panel--content">
            <List
              inline
              className="p-instance-actions"
              items={[
                <OpenTerminalBtn key="terminal" instance={instance} />,
                // TODO: update the button upon VD approval of instance detail page
                <OpenVgaBtn key="vga" instance={instance} />,
                // TODO: update the following with icon-only action buttons upon VD
                <StartStopInstanceBtn
                  key="startstop"
                  instance={instance}
                  notify={instanceListNotify}
                  hasCaption={true}
                  onStarting={() => setStarting(true)}
                  onStopping={() => setStopping(true)}
                  onFinish={() => {
                    setStarting(false);
                    setStopping(false);
                  }}
                />,
              ]}
            />
            <hr className="p-section-separator" />
            <table className="u-table-layout--auto u-no-margin--bottom">
              <tbody>
                <tr>
                  <th className="u-text--muted">Name</th>
                  <td>
                    <Link
                      to={`/ui/${instance.project}/instances/${instance.name}`}
                    >
                      {instance.name}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Base image</th>
                  <td>
                    <Row>
                      <Col
                        size={6}
                        className="u-truncate"
                        title={instance.config["image.description"]}
                      >
                        {instance.config["image.description"] || "-"}
                      </Col>
                    </Row>
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Status</th>
                  <td>
                    <InstanceStatusIcon
                      instance={instance}
                      isStarting={isStarting}
                      isStopping={isStopping}
                    />
                  </td>
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
                        (item) => item.value === instance.type
                      )[0].label
                    }
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">IPv4</th>
                  <td>
                    {ip4Addresses.length ? (
                      <>
                        {ip4Addresses.slice(0, ip4DisplayCount)}
                        {ip4DisplayCount < ip4Addresses.length && (
                          <Button
                            appearance="link"
                            className="u-no-margin--bottom"
                            small
                            onClick={() =>
                              setIp4DisplayCount(ip4Addresses.length)
                            }
                          >
                            Show all
                          </Button>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">IPv6</th>
                  <td>
                    {ip6Addresses.length ? (
                      <>
                        {ip6Addresses.slice(0, ip6DisplayCount)}
                        {ip6DisplayCount < ip6Addresses.length && (
                          <Button
                            appearance="link"
                            className="u-no-margin--bottom"
                            small
                            onClick={() =>
                              setIp6DisplayCount(ip6Addresses.length)
                            }
                          >
                            Show all
                          </Button>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Architecture</th>
                  <td>{instance.architecture}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">PID</th>
                  <td>{instance.state?.pid ? instance.state.pid : "-"}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Created</th>
                  <td>{isoTimeToString(instance.created_at)}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Last used</th>
                  <td>{isoTimeToString(instance.last_used_at)}</td>
                </tr>
              </tbody>
            </table>
            <Row className="no-grid-gap">
              <Col size={6}>
                <h5 className="p-muted-heading">Profiles</h5>
              </Col>
              <Col
                size={6}
                title="View configurations"
                className="p-action-link p-text--small u-align--right u-no-margin--bottom u-truncate"
              >
                <Link
                  // TODO: fix this link to point to the configurations tab
                  to={`/ui/${instance.project}/instances/${instance.name}`}
                >
                  View configurations
                </Link>
              </Col>
            </Row>
            <List
              className="u-no-margin--bottom"
              items={instance.profiles.map((name) => (
                <Link
                  key={name}
                  to={`/ui/${instance.project}/profiles/${name}`}
                >
                  {name}
                </Link>
              ))}
            />
            <hr className="u-spaced-hr p-section-separator" />
            <h5 className="p-muted-heading">Networks</h5>
            <List
              className="u-no-margin--bottom"
              items={Object.values(instance.expanded_devices)
                .filter(isNicDevice)
                .map((item) => (
                  // TODO: fix this link to point to the network detail page
                  <Link
                    key={item.network}
                    to={`/ui/${instance.project}/networks`}
                  >
                    {item.network}
                  </Link>
                ))}
            />
            <hr className="u-spaced-hr p-section-separator" />
            <Row className="no-grid-gap">
              <Col size={8}>
                <h5 className="p-muted-heading">Recent Snapshots</h5>
              </Col>
              <Col
                size={4}
                title={manageSnapshotLabel}
                className="p-action-link p-text--small u-align--right u-no-margin--bottom u-truncate"
              >
                <Link
                  to={`/ui/${instance.project}/instances/${instance.name}/snapshots`}
                >
                  {manageSnapshotLabel}
                </Link>
              </Col>
            </Row>
            <List
              className="u-no-margin--bottom"
              items={
                instance.snapshots
                  ?.reverse()
                  .slice(0, RECENT_SNAPSHOT_LIMIT)
                  .map((snapshot) => (
                    <Row key={snapshot.name} className="no-grid-gap">
                      <Col
                        size={4}
                        className="u-truncate"
                        title={snapshot.name}
                      >
                        {snapshot.name}
                      </Col>
                      <Col
                        size={8}
                        className="p-snapshot-creation u-align--right u-text--muted u-no-margin--bottom"
                      >
                        <i>{isoTimeToString(snapshot.created_at)}</i>
                      </Col>
                    </Row>
                  )) ?? ["None"]
              }
            />
          </div>
        </div>
      )}
    </Aside>
  );
};

export default InstanceDetailPanel;
