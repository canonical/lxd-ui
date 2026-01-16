import type { FC } from "react";
import InstanceLink from "./InstanceLink";
import type { LxdInstance } from "types/instance";
import InstanceStatusIcon from "./InstanceStatusIcon";
import InstanceIps from "./InstanceIps";
import { getRootPool, isoTimeToString } from "util/helpers";
import { Link } from "react-router-dom";
import { List } from "@canonical/react-components";
import { isNicDevice } from "util/devices";
import { getIpAddresses } from "util/networks";
import { useInstanceLoading } from "context/instanceLoading";
import { useIsClustered } from "context/useIsClustered";
import InstanceMACAddresses from "pages/instances/InstanceMACAddresses";
import ResourceLink from "components/ResourceLink";
import InstanceClusterMemberChip from "./InstanceClusterMemberChip";
import { getImageLink, getInstanceType } from "util/instances";
import ProfileRichChip from "pages/profiles/ProfileRichChip";
import DevicesSummaryList from "components/DevicesSummaryList";
import type { LxdDevices } from "types/device";
import NetworkRichChip from "pages/networks/NetworkRichChip";
import ExpandableList from "components/ExpandableList";

const RECENT_SNAPSHOT_LIMIT = 5;

interface Props {
  instance: LxdInstance;
}

const InstanceDetailPanelContent: FC<Props> = ({ instance }) => {
  const networkDevices = Object.values(instance?.expanded_devices ?? {}).filter(
    isNicDevice,
  );

  const instanceLoading = useInstanceLoading();
  const loadingType = instanceLoading.getType(instance);

  const instanceUrl = `/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}`;

  const isClustered = useIsClustered();

  const pid =
    !instance.state || instance.state.pid === 0 ? "-" : instance.state.pid;
  const rootPool = getRootPool(instance);

  return (
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
              {getImageLink(instance)}
            </div>
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Status</th>
          <td key={instance.status + loadingType}>
            <InstanceStatusIcon instance={instance} />
          </td>
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
          <th className="u-text--muted">MAC addresses</th>
          <td key={getIpAddresses(instance, "inet6").length}>
            <InstanceMACAddresses instance={instance} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Architecture</th>
          <td>{instance.architecture}</td>
        </tr>
        {isClustered && (
          <tr>
            <th className="u-text--muted">Cluster member</th>
            <td>
              <InstanceClusterMemberChip instance={instance} />
            </td>
          </tr>
        )}
        <tr>
          <th className="u-text--muted">Root storage</th>
          <td>
            <ResourceLink
              type="pool"
              value={rootPool}
              to={`/ui/project/${encodeURIComponent(instance.project)}/storage/pool/${encodeURIComponent(rootPool)}`}
            />
          </td>
        </tr>
        <tr className="list-wrapper">
          <th className="u-text--muted">Networks</th>
          <td>
            {networkDevices.length > 0 ? (
              <ExpandableList
                items={networkDevices.map((device) => (
                  <NetworkRichChip
                    key={device.network}
                    networkName={device.network}
                    projectName={instance.project}
                  />
                ))}
              />
            ) : (
              <p>
                No networks found.
                <br />
                <Link
                  to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/configuration/networks`}
                >
                  Configure instance networks
                </Link>
              </p>
            )}
          </td>
        </tr>
        <tr className="list-wrapper">
          <th className="u-text--muted">Devices</th>
          <td>
            <DevicesSummaryList
              devices={Object.values(instance.expanded_devices as LxdDevices)}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">PID</th>
          <td>{pid}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Created</th>
          <td>{isoTimeToString(instance.created_at)}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Last used</th>
          <td>{isoTimeToString(instance.last_used_at)}</td>
        </tr>
        <tr>
          <th>
            <h3 className="p-muted-heading p-heading--5">
              <Link to={`${instanceUrl}/configuration`}>Profiles</Link>
            </h3>
          </th>
          <td>
            <List
              className="list u-no-margin--bottom"
              items={instance.profiles.map((name) => (
                <ProfileRichChip
                  key={name}
                  profileName={name}
                  projectName={instance.project}
                />
              ))}
            />
          </td>
        </tr>
        <tr className="u-no-border">
          <th colSpan={2} className="snapshots-header">
            <h3 className="p-muted-heading p-heading--5">
              <Link to={`${instanceUrl}/snapshots`}>Snapshots</Link>
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
                  <th>
                    <ResourceLink
                      key={snapshot.name}
                      type="snapshot"
                      value={snapshot.name}
                      to={`${instanceUrl}/snapshots`}
                    />
                  </th>
                  <td className="u-text--muted">
                    <i>{isoTimeToString(snapshot.created_at)}</i>
                  </td>
                </tr>
              ))}
            {instance.snapshots.length > RECENT_SNAPSHOT_LIMIT && (
              <tr>
                <td colSpan={2}>
                  <Link to={`${instanceUrl}/snapshots`}>
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
                <Link to={`${instanceUrl}/snapshots`}>
                  Manage instance snapshots
                </Link>
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default InstanceDetailPanelContent;
