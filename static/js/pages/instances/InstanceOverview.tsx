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
import { Col, List, Row } from "@canonical/react-components";
import Loader from "components/Loader";
import { NotificationHelper } from "types/notification";
import { LxdInstance } from "types/instance";
import CopyButton from "components/CopyButton";

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
          <Row key={item.address}>
            <Col size={11} className="u-truncate" title={item.address}>
              {item.address}
            </Col>
            <Col size={1}>
              <CopyButton text={item.address} className="u-float-right" />
            </Col>
          </Row>
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
            <th>Name</th>
            <td>{instance.name}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{instance.description !== "" ? instance.description : "-"}</td>
          </tr>
          <tr>
            <th>Created at</th>
            <td>{isoTimeToString(instance.created_at)}</td>
          </tr>
          <tr>
            <th>Last used at</th>
            <td>{isoTimeToString(instance.last_used_at)}</td>
          </tr>
          <tr>
            <th>IPv4</th>
            <td>
              {ipv4Addresses && ipv4Addresses.length > 0 ? ipv4Addresses : "-"}
            </td>
          </tr>
          <tr>
            <th>IPv6</th>
            <td>
              {ipv6Addresses && ipv6Addresses.length > 0 ? ipv6Addresses : "-"}
            </td>
          </tr>
          <tr>
            <td>Memory</td>
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
            <td>Disk</td>
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
            <th>Type</th>
            <td>{instance.type}</td>
          </tr>
          <tr>
            <th>Architecture</th>
            <td>{instance.architecture}</td>
          </tr>
          <tr>
            <th>Image</th>
            <td>{instance.config["image.description"]}</td>
          </tr>
          <tr>
            <th>Stateful</th>
            <td>{instance.stateful ? "true" : "false"}</td>
          </tr>
          <tr>
            <th>Project</th>
            <td>{instance.project}</td>
          </tr>
          <tr>
            <th>Profiles</th>
            <td>
              <List
                className="u-no-margin--bottom"
                items={instance.profiles.map((name) => (
                  <a key={name} href={`/ui/profiles/${name}`}>
                    {name}
                  </a>
                ))}
              />
            </td>
          </tr>
          <tr>
            <th>Location</th>
            <td>{instance.location}</td>
          </tr>
          <tr>
            <th>Ephemeral</th>
            <td>{instance.ephemeral ? "true" : "false"}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default InstanceOverview;
