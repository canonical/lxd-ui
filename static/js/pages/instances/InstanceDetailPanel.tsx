import React, { FC } from "react";
import StartInstanceBtn from "./actions/StartInstanceBtn";
import StopInstanceBtn from "./actions/StopInstanceBtn";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenVgaBtn from "./actions/OpenVgaBtn";
import { LxdInstance } from "types/instance";
import { Button, Col, List, Row } from "@canonical/react-components";
import { NotificationHelper } from "types/notification";
import { isoTimeToString } from "util/helpers";
import { isNicDevice } from "util/devices";
import OpenInstanceDetailBtn from "pages/instances/actions/OpenInstanceDetailBtn";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  onClose: () => void;
}

const InstanceDetailPanel: FC<Props> = ({ instance, notify, onClose }) => {
  const btnProps = {
    instance: instance,
    notify: notify,
  };

  return (
    <div className="p-panel p-instance-detail-panel">
      <div className="p-panel__header p-instance-detail-panel--header">
        <div className="p-panel__title">Instance details</div>
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
      <div className="p-panel__content p-instance-detail-panel--content">
        <List
          inline
          className="u-float-right"
          items={[
            <OpenTerminalBtn key="terminal" instance={instance} />,
            <OpenVgaBtn key="vga" instance={instance} />,
            <OpenInstanceDetailBtn
              key="details"
              instanceName={instance.name}
            />,
          ]}
        />
        <table className="u-table-layout--auto">
          <tbody>
            <tr>
              <th>Name</th>
              <td>
                <a href={`/instances/${instance.name}`}>{instance.name}</a>
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
                    instance.status === "Running" ? (
                      <StopInstanceBtn key="stop" {...btnProps} />
                    ) : (
                      <StartInstanceBtn key="start" {...btnProps} />
                    ),
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
              <th>Date created</th>
              <td>{isoTimeToString(instance.created_at)}</td>
            </tr>
            <tr>
              <th>Last used</th>
              <td>{isoTimeToString(instance.last_used_at)}</td>
            </tr>
          </tbody>
        </table>
        <h5 className="u-no-margin--bottom">Profiles</h5>
        <List
          className="u-no-margin--bottom"
          items={instance.profiles.map((name) => (
            <a key={name} href={`/profiles/${name}`}>
              {name}
            </a>
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
            <a href={`/instances/${instance.name}/snapshots`}>
              Manage snapshots
            </a>
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
