import React, { FC, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { getInstanceMetrics } from "util/metricSelectors";
import Meter from "components/Meter";
import { Col, MainTable, Row } from "@canonical/react-components";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { Link } from "react-router-dom";
import { instanceCreationTypes } from "util/instanceOptions";
import { fetchNetworks } from "api/networks";
import { isNicDevice } from "util/devices";
import { fetchProfiles } from "api/profiles";
import { Notification } from "types/notification";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import { failure } from "context/notify";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";

interface Props {
  instance: LxdInstance;
}

const InstanceOverview: FC<Props> = ({ instance }) => {
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);

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
    setInTabNotification(failure("Could not load metrics.", metricError));
  }

  const instanceMetrics = getInstanceMetrics(metrics, instance);

  const {
    data: networks = [],
    error: networkError,
    isLoading: isNetworkLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, instance.project],
    queryFn: () => fetchNetworks(instance.project),
  });

  if (networkError) {
    setInTabNotification(failure("Could not load networks.", networkError));
  }

  const instanceNetworks = Object.values(instance.expanded_devices)
    .filter(isNicDevice)
    .map((network) => network.network);

  const networksHeaders = [
    { content: "Name", sortKey: "name" },
    { content: "Type", sortKey: "type" },
    { content: "Managed", sortKey: "managed" },
    { content: "IPV4", className: "u-align--right" },
    { content: "IPV6" },
  ];

  const networksRows = networks
    .filter((network) => instanceNetworks.includes(network.name))
    .map((network) => {
      return {
        columns: [
          {
            content: (
              // TODO: fix this link to point to the network detail page
              <Link
                to={`/ui/${instance.project}/networks`}
                title={network.name}
              >
                {network.name}
              </Link>
            ),
            role: "rowheader",
            "aria-label": "Name",
          },
          {
            content: network.type,
            role: "rowheader",
            "aria-label": "Type",
          },
          {
            content: network.managed ? "Yes" : "No",
            role: "rowheader",
            "aria-label": "Managed",
          },
          {
            content: network.config["ipv4.address"],
            className: "u-align--right",
            role: "rowheader",
            title: network.config["ipv4.address"],
            "aria-label": "IPV4",
          },
          {
            content: network.config["ipv6.address"],
            role: "rowheader",
            title: network.config["ipv6.address"],
            "aria-label": "IPV6",
          },
        ],
        sortData: {
          name: network.name,
          type: network.type,
          managed: network.managed,
        },
      };
    });

  const {
    data: profiles = [],
    error: profileError,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, instance.project],
    queryFn: () => fetchProfiles(instance.project),
  });

  if (profileError) {
    setInTabNotification(failure("Could not load profiles.", profileError));
  }

  const profileHeaders = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
  ];

  const profileRows = profiles
    .filter((profile) => instance.profiles.includes(profile.name))
    .map((profile) => {
      return {
        columns: [
          {
            content: (
              <Link
                to={`/ui/${instance.project}/profiles/detail/${profile.name}`}
                title={profile.name}
              >
                {profile.name}
              </Link>
            ),
            role: "rowheader",
            "aria-label": "Name",
          },
          {
            content: profile.description,
            role: "rowheader",
            title: profile.description,
            "aria-label": "Description",
          },
        ],
        sortData: {
          name: profile.name,
          description: profile.description,
        },
      };
    });

  const updateContentHeight = () => {
    updateMaxHeight("instance-overview-tab");
  };
  useEffect(updateContentHeight, [inTabNotification]);
  useEventListener("resize", updateContentHeight);

  if (isMetricLoading) {
    return <Loader text="Loading metrics..." />;
  }

  if (isNetworkLoading) {
    return <Loader text="Loading networks..." />;
  }

  if (isProfileLoading) {
    return <Loader text="Loading profiles..." />;
  }

  return (
    <div className="instance-overview-tab">
      <NotificationRowLegacy
        notification={inTabNotification}
        onDismiss={() => setInTabNotification(null)}
      />
      <Row className="general">
        <Col size={3}>
          <h2 className="p-heading--4">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">Base image</th>
                <td>{instance.config["image.description"] ?? "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{instance.description ? instance.description : "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Type</th>
                <td>
                  {
                    instanceCreationTypes.filter(
                      (item) => item.value === instance.type
                    )[0].label
                  }
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Architecture</th>
                <td>{instance.architecture}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Date created</th>
                <td>{isoTimeToString(instance.created_at)}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Last used</th>
                <td>{isoTimeToString(instance.last_used_at)}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="usage">
        <Col size={3}>
          <h2 className="p-heading--4">Usage</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr className="metric-row">
                <th className="p-muted-heading">Memory</th>
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
                <th className="p-muted-heading">Disk</th>
                <td>
                  {instanceMetrics.disk ? (
                    <div>
                      <Meter
                        percentage={
                          (100 / instanceMetrics.disk.total) *
                          (instanceMetrics.disk.total -
                            instanceMetrics.disk.free)
                        }
                        text={
                          humanFileSize(
                            instanceMetrics.disk.total -
                              instanceMetrics.disk.free
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
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--4">Networks</h2>
        </Col>
        <Col size={7}>
          <MainTable headers={networksHeaders} rows={networksRows} sortable />
        </Col>
      </Row>
      <Row className="profiles">
        <Col size={3}>
          <h2 className="p-heading--4">Profiles</h2>
        </Col>
        <Col size={7}>
          <MainTable headers={profileHeaders} rows={profileRows} sortable />
        </Col>
      </Row>
    </div>
  );
};

export default InstanceOverview;
