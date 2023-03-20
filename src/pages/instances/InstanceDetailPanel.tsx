import React, { FC, useState } from "react";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenConsoleBtn from "./actions/OpenConsoleBtn";
import { Button, Col, List, Row } from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import { isNicDevice } from "util/devices";
import { Link } from "react-router-dom";
import InstanceStatusIcon from "./InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import Aside from "components/Aside";
import usePanelParams from "util/usePanelParams";
import { useNotify } from "context/notify";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import InstanceLink from "pages/instances/InstanceLink";

const RECENT_SNAPSHOT_LIMIT = 5;

const InstanceDetailPanel: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, panelParams.instance, panelParams.project],
    queryFn: () =>
      fetchInstance(panelParams.instance ?? "", panelParams.project),
    enabled: panelParams.instance !== null,
  });

  if (error) {
    notify.failure("Could not load instance details.", error);
  }

  const [ip4DisplayCount, setIp4DisplayCount] = useState(5);
  const [ip6DisplayCount, setIp6DisplayCount] = useState(5);

  const getIpAddresses = (family: string) => {
    return (
      instance?.state?.network?.eth0?.addresses
        .filter((item) => item.family === family)
        .map((item) => {
          return (
            <div
              key={item.address}
              className="ip u-truncate"
              title={item.address}
            >
              {item.address}
            </div>
          );
        }) ?? []
    );
  };
  const ip4Addresses = getIpAddresses("inet");
  const ip6Addresses = getIpAddresses("inet6");

  return (
    <Aside width="narrow" pinned className="u-hide--medium u-hide--small">
      {isLoading && <Loader />}
      {!isLoading && !instance && <>Could not load instance details.</>}
      {instance && (
        <div className="p-panel instance-detail-panel">
          <div className="p-panel__header">
            <h2 className="p-panel__title">Instance summary</h2>
            <div className="p-panel__controls">
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                hasIcon
                onClick={panelParams.clear}
              >
                <i className="p-icon--close">Close</i>
              </Button>
            </div>
          </div>
          <div className="p-panel__content panel-content">
            <div className="actions">
              <List
                inline
                className="primary actions-list"
                items={[
                  <OpenTerminalBtn key="terminal" instance={instance} />,
                  <OpenConsoleBtn key="console" instance={instance} />,
                ]}
              />
              <div className="state">
                <InstanceStateActions instance={instance} />
              </div>
            </div>
            <div className="content-scroll">
              <table className="u-table-layout--auto u-no-margin--bottom">
                <tbody>
                  <tr>
                    <th className="u-text--muted">Name</th>
                    <td>
                      <InstanceLink instance={instance} />
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Base image</th>
                    <td>
                      <div
                        className="u-truncate base-image"
                        title={instance.config["image.description"]}
                      >
                        {instance.config["image.description"] ?? "-"}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">Status</th>
                    <td>
                      <InstanceStatusIcon instance={instance} />
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
                    <th className="u-text--muted">Created</th>
                    <td>{isoTimeToString(instance.created_at)}</td>
                  </tr>
                  <tr>
                    <th className="u-text--muted last-used">Last used</th>
                    <td>{isoTimeToString(instance.last_used_at)}</td>
                  </tr>
                  <tr>
                    <th>
                      <h3 className="p-muted-heading p-heading--5">
                        <Link
                          to={`/ui/${instance.project}/instances/detail/${instance.name}/configuration`}
                        >
                          Profiles
                        </Link>
                      </h3>
                    </th>
                    <td>
                      <List
                        className="list"
                        items={instance.profiles.map((name) => (
                          <Link
                            key={name}
                            to={`/ui/${instance.project}/profiles/detail/${name}`}
                          >
                            {name}
                          </Link>
                        ))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <h3 className="p-muted-heading p-heading--5">Networks</h3>
                    </th>
                    <td>
                      <List
                        className="list"
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
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <h3 className="p-muted-heading p-heading--5">
                        <Link
                          to={`/ui/${instance.project}/instances/detail/${instance.name}/snapshots`}
                        >
                          Recent snapshots
                        </Link>
                      </h3>
                      {instance.snapshots?.length ? (
                        <List
                          items={instance.snapshots
                            .reverse()
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
                            ))}
                        />
                      ) : (
                        <p>
                          No snapshots found.
                          <br />
                          Create one in{" "}
                          <Link
                            to={`/ui/${instance.project}/instances/detail/${instance.name}/snapshots`}
                          >
                            Snapshots
                          </Link>
                          .
                        </p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Aside>
  );
};

export default InstanceDetailPanel;
