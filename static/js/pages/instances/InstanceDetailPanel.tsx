import React, { FC } from "react";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenVgaBtn from "./actions/OpenVgaBtn";
import { LxdInstance } from "types/instance";
import { Button, Col, List, Row } from "@canonical/react-components";
import { NotificationHelper } from "types/notification";
import { isoTimeToString } from "util/helpers";
import { isNicDevice } from "util/devices";
import OpenInstanceDetailBtn from "pages/instances/actions/OpenInstanceDetailBtn";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import { Link } from "react-router-dom";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  onClose: () => void;
}

const InstanceDetailPanel: FC<Props> = ({ instance, notify, onClose }) => {
  const getIpAddresses = (family: string) => {
    return instance.state?.network?.eth0?.addresses
      .filter((item) => item.family === family)
      .map((item) => {
        return (
          <Row key={item.address}>
            <Col size={4} className="u-truncate" title={item.address}>
              {item.address}
            </Col>
          </Row>
        );
      });
  };
  const ipv4Addresses = getIpAddresses("inet");
  const ipv6Addresses = getIpAddresses("inet6");

  return (
    <div className="p-panel p-instance-detail-panel">
      <div className="p-panel__header p-instance-detail-panel--header">
        <div className="p-panel__title-wrapper">
          <div className="p-panel__title">
            <span className="u-no-margin--bottom">Instance summary</span>
            <span className="u-no-margin--bottom">
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
        <hr />
      </div>
      <div className="p-panel__content p-instance-detail-panel--content">
        <List
          inline
          className="u-float-right"
          items={[
            <OpenTerminalBtn key="terminal" instance={instance} />,
            <OpenVgaBtn key="vga" instance={instance} />,
            <OpenInstanceDetailBtn key="details" instance={instance} />,
          ]}
        />
        <table className="u-table-layout--auto">
          <tbody>
            <tr>
              <th>Name</th>
              <td>
                <Link to={`/ui/${instance.project}/instances/${instance.name}`}>
                  {instance.name}
                </Link>
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                <List
                  className="u-sv-3"
                  inline
                  items={[
                    <span key="status">{instance.status}</span>,
                    <StartStopInstanceBtn
                      key="button"
                      instance={instance}
                      notify={notify}
                      isDense={true}
                    />,
                  ]}
                />
              </td>
            </tr>
            <tr>
              <th>Type</th>
              <td>{instance.type}</td>
            </tr>
            <tr>
              <th>Architecture</th>
              <td>{instance.architecture}</td>
            </tr>
            <tr>
              <th>Image</th>
              <td>
                <Row>
                  <Col
                    size={4}
                    className="u-truncate"
                    title={instance.config["image.description"]}
                  >
                    {instance.config["image.description"]}
                  </Col>
                </Row>
              </td>
            </tr>
            <tr>
              <th>Date created</th>
              <td>{isoTimeToString(instance.created_at)}</td>
            </tr>
            <tr>
              <th>Last used</th>
              <td>{isoTimeToString(instance.last_used_at)}</td>
            </tr>
            {ipv4Addresses && ipv4Addresses.length > 0 && (
              <tr>
                <th>IPv4</th>
                <td>{ipv4Addresses}</td>
              </tr>
            )}
            {ipv6Addresses && ipv6Addresses.length > 0 && (
              <tr>
                <th>IPv6</th>
                <td>{ipv6Addresses}</td>
              </tr>
            )}
          </tbody>
        </table>
        <h5 className="u-no-margin--bottom">Profiles</h5>
        <List
          className="u-no-margin--bottom"
          items={instance.profiles.map((name) => (
            <Link key={name} to={`/ui/${instance.project}/profiles/${name}`}>
              {name}
            </Link>
          ))}
        />
        <h5 className="u-no-margin--bottom">Networks</h5>
        <List
          className="u-no-margin--bottom"
          items={Object.values(instance.expanded_devices)
            .filter(isNicDevice)
            .map((item) =>
              item.name ? `${item.name}: ${item.network}` : item.network
            )}
        />
        <Row>
          <Col size={1}>
            <h5 className="u-no-margin--bottom">Snapshots</h5>
          </Col>
          <Col
            size={3}
            className="p-snapshot-link p-text--small u-align--right u-no-margin--bottom"
          >
            <Link
              to={`/ui/${instance.project}/instances/${instance.name}/snapshots`}
            >
              Manage snapshots
            </Link>
          </Col>
        </Row>
        <List
          className="u-no-margin--bottom"
          items={
            instance.snapshots?.map((snapshot) => (
              <Row key={snapshot.name}>
                <Col size={1} className="u-truncate" title={snapshot.name}>
                  {snapshot.name}
                </Col>
                <Col
                  size={3}
                  className="p-snapshot-creation p-text--small u-align--right u-text--muted u-no-margin--bottom"
                >
                  created {isoTimeToString(snapshot.created_at)}
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
