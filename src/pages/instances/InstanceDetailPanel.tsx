import React, { FC } from "react";
import OpenTerminalBtn from "./actions/OpenTerminalBtn";
import OpenConsoleBtn from "./actions/OpenConsoleBtn";
import { Button, Icon, List } from "@canonical/react-components";
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
import { getIpAddresses } from "util/networks";
import ExpandableList from "../../components/ExpandableList";
import ItemName from "components/ItemName";

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
    notify.failure("Loading instance failed", error);
  }

  const ip4Addresses = getIpAddresses("inet", instance);
  const ip6Addresses = getIpAddresses("inet6", instance);

  const networkDevices = Object.values(instance?.expanded_devices ?? {}).filter(
    isNicDevice
  );

  return (
    <Aside width="narrow" pinned className="u-hide--medium u-hide--small">
      {isLoading && <Loader />}
      {!isLoading && !instance && <>Loading instance failed</>}
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
                aria-label="Close"
              >
                <Icon name="close" />
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
                        <ExpandableList items={ip4Addresses} />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="u-text--muted">IPv6</th>
                    <td>
                      {ip6Addresses.length ? (
                        <ExpandableList items={ip6Addresses} />
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
                  {networkDevices.length > 0 ? (
                    <tr>
                      <th>
                        <h3 className="p-muted-heading p-heading--5">
                          Networks
                        </h3>
                      </th>
                      <td>
                        <List
                          className="list"
                          items={networkDevices.map((item) => (
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
                  ) : (
                    <tr>
                      <td colSpan={2}>
                        <h3 className="p-muted-heading p-heading--5">
                          Networks
                        </h3>
                        <p>
                          No networks found.
                          <br />
                          <Link
                            to={`/ui/${instance.project}/instances/detail/${instance.name}/configuration/networks`}
                          >
                            Configure
                          </Link>{" "}
                          instance networks.
                        </p>
                      </td>
                    </tr>
                  )}
                  <tr className="u-no-border">
                    <th colSpan={2} className="snapshots-header">
                      <h3 className="p-muted-heading p-heading--5">
                        <Link
                          to={`/ui/${instance.project}/instances/detail/${instance.name}/snapshots`}
                        >
                          Snapshots
                        </Link>
                      </h3>
                    </th>
                  </tr>
                  {instance.snapshots?.length ? (
                    <>
                      {instance.snapshots
                        .slice()
                        .sort((snap1, snap2) => {
                          const a = snap1.created_at;
                          const b = snap2.created_at;
                          return a > b ? -1 : a < b ? 1 : 0;
                        })
                        .slice(0, RECENT_SNAPSHOT_LIMIT)
                        .map((snapshot) => (
                          <tr key={snapshot.name} className="u-no-border">
                            <th
                              title={snapshot.name}
                              className="snapshot-name u-truncate"
                            >
                              <ItemName item={snapshot} />
                            </th>
                            <td className="u-text--muted">
                              <i>{isoTimeToString(snapshot.created_at)}</i>
                            </td>
                          </tr>
                        ))}
                      {instance.snapshots.length > RECENT_SNAPSHOT_LIMIT && (
                        <tr>
                          <td colSpan={2}>
                            <Link
                              to={`/ui/${instance.project}/instances/detail/${instance.name}/snapshots`}
                            >
                              {`View all (${instance.snapshots.length})`}
                            </Link>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={2}>
                        <p className="no-snapshots">
                          No snapshots found.
                          <br />
                          <Link
                            to={`/ui/${instance.project}/instances/detail/${instance.name}/snapshots`}
                          >
                            Manage
                          </Link>{" "}
                          instance snapshots.
                        </p>
                      </td>
                    </tr>
                  )}
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
