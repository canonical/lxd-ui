import React, { FC, useState } from "react";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenVgaBtn from "./actions/OpenVgaBtn";
import { LxdInstance } from "types/instance";
import { Button, Col, List, Row } from "@canonical/react-components";
import { NotificationHelper } from "types/notification";
import { isoTimeToString } from "util/helpers";
import { isNicDevice } from "util/devices";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import { Link } from "react-router-dom";
import InstanceStatusIcon from "./InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";

const RECENT_SNAPSHOT_LIMIT = 5;

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  onClose: () => void;
  starting: string[];
  stopping: string[];
  addStarting: (instance: LxdInstance) => void;
  addStopping: (instance: LxdInstance) => void;
  removeLoading: (instance: LxdInstance) => void;
}

const InstanceDetailPanel: FC<Props> = ({
  instance,
  notify,
  onClose,
  starting,
  stopping,
  addStarting,
  addStopping,
  removeLoading,
}) => {
  const [ip4DisplayCount, setIp4DisplayCount] = useState(5);
  const [ip6DisplayCount, setIp6DisplayCount] = useState(5);

  const getIpAddresses = (family: string) => {
    return (
      instance.state?.network?.eth0?.addresses
        .filter((item) => item.family === family)
        .map((item) => {
          return (
            <Row key={item.address}>
              <Col size={4} className="u-truncate" title={item.address}>
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
    instance.snapshots && instance.snapshots.length > RECENT_SNAPSHOT_LIMIT
      ? "View all"
      : "Manage";

  return (
    <div className="p-panel p-instance-detail-panel">
      <div className="p-panel__header p-instance-detail-panel--header">
        <div className="p-panel__title-wrapper">
          <div className="p-panel__title">
            <span className="u-no-margin--bottom">Instance summary</span>
            <span title="View more" className="u-no-margin--bottom u-truncate">
              <Link to={`/ui/${instance.project}/instances/${instance.name}`}>
                View more
              </Link>
            </span>
          </div>
          <div className="p-panel__controls">
            <Button
              appearance="base"
              className="u-no-margin--bottom"
              hasIcon
              onClick={onClose}
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
              notify={notify}
              hasCaption={true}
              onStarting={addStarting}
              onStopping={addStopping}
              onFinish={removeLoading}
            />,
          ]}
        />
        <hr className="p-section-separator" />
        <table className="u-table-layout--auto u-no-margin--bottom">
          <tbody>
            <tr>
              <th className="u-text--muted">Name</th>
              <td>
                <Link to={`/ui/${instance.project}/instances/${instance.name}`}>
                  {instance.name}
                </Link>
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Base image</th>
              <td>
                <Row>
                  <Col
                    size={4}
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
                  isStarting={starting.includes(instance.name)}
                  isStopping={stopping.includes(instance.name)}
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
                        onClick={() => setIp4DisplayCount(ip4Addresses.length)}
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
                        onClick={() => setIp6DisplayCount(ip6Addresses.length)}
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
              <th className="u-text--muted">Date created</th>
              <td>{isoTimeToString(instance.created_at)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Last used</th>
              <td>{isoTimeToString(instance.last_used_at)}</td>
            </tr>
          </tbody>
        </table>
        <Row>
          <Col size={1}>
            <h5 className="p-text--x-small-capitalised u-no-margin--bottom">
              Profiles
            </h5>
          </Col>
          <Col
            size={3}
            title="View configurations"
            className="p-snapshot-link p-text--small u-align--right u-no-margin--bottom u-truncate"
          >
            <strong>
              <Link
                // TODO: fix this link to point to the configurations tab
                to={`/ui/${instance.project}/instances/${instance.name}`}
              >
                View configurations
              </Link>
            </strong>
          </Col>
        </Row>
        <List
          className="u-no-margin--bottom"
          items={instance.profiles.map((name) => (
            <Link key={name} to={`/ui/${instance.project}/profiles/${name}`}>
              {name}
            </Link>
          ))}
        />
        <hr className="u-spaced-hr p-section-separator" />
        <h5 className="p-text--x-small-capitalised u-no-margin--bottom">
          Networks
        </h5>
        <List
          className="u-no-margin--bottom"
          items={Object.values(instance.expanded_devices)
            .filter(isNicDevice)
            .map((item) => (
              // TODO: fix this link to point to the network detail page
              <Link key={item.network} to={`/ui/${instance.project}/networks`}>
                {item.network}
              </Link>
            ))}
        />
        <hr className="u-spaced-hr p-section-separator" />
        <Row>
          <Col size={3}>
            <h5 className="p-text--x-small-capitalised u-no-margin--bottom">
              Recent Snapshots
            </h5>
          </Col>
          <Col
            size={1}
            title={manageSnapshotLabel}
            className="p-snapshot-link p-text--small u-align--right u-no-margin--bottom u-truncate"
          >
            <strong>
              <Link
                to={`/ui/${instance.project}/instances/${instance.name}/snapshots`}
              >
                {manageSnapshotLabel}
              </Link>
            </strong>
          </Col>
        </Row>
        <List
          className="u-no-margin--bottom"
          items={
            instance.snapshots
              ?.reverse()
              .slice(0, RECENT_SNAPSHOT_LIMIT)
              .map((snapshot) => (
                <Row key={snapshot.name}>
                  <Col size={2} className="u-truncate" title={snapshot.name}>
                    {snapshot.name}
                  </Col>
                  <Col
                    size={2}
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
  );
};

export default InstanceDetailPanel;
