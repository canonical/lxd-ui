import { FC } from "react";
import InstanceLink from "./InstanceLink";
import { LxdInstance } from "types/instance";
import InstanceStatusIcon from "./InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";
import InstanceIps from "./InstanceIps";
import { isoTimeToString } from "util/helpers";
import { Link } from "react-router-dom";
import { List } from "@canonical/react-components";
import ItemName from "components/ItemName";
import { useSettings } from "context/useSettings";
import { isNicDevice } from "util/devices";

const RECENT_SNAPSHOT_LIMIT = 5;

interface Props {
  instance: LxdInstance;
}

const InstanceDetailPanelContent: FC<Props> = ({ instance }) => {
  const { data: settings } = useSettings();
  const networkDevices = Object.values(instance?.expanded_devices ?? {}).filter(
    isNicDevice,
  );

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
          <th className="u-text--muted">Location</th>
          <td>
            {settings?.environment?.server_clustered ? instance.location : "-"}
          </td>
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
                to={`/ui/project/${instance.project}/instance/${instance.name}/configuration`}
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
                  to={`/ui/project/${instance.project}/profile/${name}`}
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
              <h3 className="p-muted-heading p-heading--5">Networks</h3>
            </th>
            <td>
              <List
                className="list"
                items={networkDevices.map((item) => (
                  <Link
                    key={item.network}
                    to={`/ui/project/${instance.project}/network/${item.network}`}
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
              <h3 className="p-muted-heading p-heading--5">Networks</h3>
              <p>
                No networks found.
                <br />
                <Link
                  to={`/ui/project/${instance.project}/instance/${instance.name}/configuration/networks`}
                >
                  Configure instance networks
                </Link>
              </p>
            </td>
          </tr>
        )}
        <tr className="u-no-border">
          <th colSpan={2} className="snapshots-header">
            <h3 className="p-muted-heading p-heading--5">
              <Link
                to={`/ui/project/${instance.project}/instance/${instance.name}/snapshots`}
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
                    to={`/ui/project/${instance.project}/instance/${instance.name}/snapshots`}
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
                  to={`/ui/project/${instance.project}/instance/${instance.name}/snapshots`}
                >
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
