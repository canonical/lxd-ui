import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { getInstanceMetrics } from "util/metricSelectors";
import Meter from "components/Meter";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import EditInstanceBtn from "./actions/EditInstanceBtn";
import { createPortal } from "react-dom";
import { List } from "@canonical/react-components";
import Loader from "components/Loader";
import { NotificationHelper } from "types/notification";
import { LxdInstance } from "types/instance";
import { Link } from "react-router-dom";

interface Props {
  controlTarget?: HTMLSpanElement | null;
  instance: LxdInstance;
  notify: NotificationHelper;
}

const InstanceOverview: FC<Props> = ({ controlTarget, instance, notify }) => {
  const {
    data: metrics = [],
    error: metricError,
    isLoading: isMetricLoading,
  } = useQuery({
    queryKey: [queryKeys.metrics],
    queryFn: fetchMetrics,
    refetchInterval: 15 * 1000, // 15 seconds
  });

  if (metricError) {
    notify.failure("Could not load metrics.", metricError);
  }

  if (isMetricLoading) {
    return <Loader text="Loading metrics..." />;
  }

  const instanceMetrics = getInstanceMetrics(metrics, instance);

  const getIpAddresses = (family: string) => {
    return instance.state?.network?.eth0?.addresses
      .filter((item) => item.family === family)
      .map((item) => {
        return (
          <div key={item.address} className="u-truncate" title={item.address}>
            {item.address}
          </div>
        );
      });
  };
  const ipv4Addresses = getIpAddresses("inet");
  const ipv6Addresses = getIpAddresses("inet6");

  return (
    <>
      {controlTarget &&
        createPortal(
          <>
            <EditInstanceBtn instance={instance} />
            <DeleteInstanceBtn instance={instance} notify={notify} />
          </>,
          controlTarget
        )}
      <table>
        <tbody>
          <tr>
            <th className="u-text--muted">Name</th>
            <td>{instance.name}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Description</th>
            <td>{instance.description ? instance.description : "-"}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Created at</th>
            <td>{isoTimeToString(instance.created_at)}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Last used at</th>
            <td>{isoTimeToString(instance.last_used_at)}</td>
          </tr>
          <tr>
            <th className="u-text--muted">IPv4</th>
            <td>
              {ipv4Addresses && ipv4Addresses.length > 0 ? ipv4Addresses : "-"}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">IPv6</th>
            <td>
              {ipv6Addresses && ipv6Addresses.length > 0 ? ipv6Addresses : "-"}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Memory</th>
            <td>
              {instanceMetrics.memory ? (
                <div>
                  <Meter
                    percentage={
                      (100 / instanceMetrics.memory.total) *
                      (instanceMetrics.memory.total -
                        instanceMetrics.memory.free)
                    }
                    text={
                      humanFileSize(
                        instanceMetrics.memory.total -
                          instanceMetrics.memory.free
                      ) +
                      " of " +
                      humanFileSize(instanceMetrics.memory.total) +
                      " memory used"
                    }
                  />
                </div>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Disk</th>
            <td>
              {instanceMetrics.disk ? (
                <div>
                  <Meter
                    percentage={
                      (100 / instanceMetrics.disk.total) *
                      (instanceMetrics.disk.total - instanceMetrics.disk.free)
                    }
                    text={
                      humanFileSize(
                        instanceMetrics.disk.total - instanceMetrics.disk.free
                      ) +
                      " of " +
                      humanFileSize(instanceMetrics.disk.total) +
                      " disk used"
                    }
                  />
                </div>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Type</th>
            <td>{instance.type}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Architecture</th>
            <td>{instance.architecture}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Image</th>
            <td>{instance.config["image.description"]}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Stateful</th>
            <td>{instance.stateful ? "true" : "false"}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Project</th>
            <td>{instance.project}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Profiles</th>
            <td>
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
            </td>
          </tr>
          <tr>
            <th className="u-text--muted">Location</th>
            <td>{instance.location}</td>
          </tr>
          <tr>
            <th className="u-text--muted">Ephemeral</th>
            <td>{instance.ephemeral ? "true" : "false"}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default InstanceOverview;
