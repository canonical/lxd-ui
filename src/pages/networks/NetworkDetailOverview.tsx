import { FC, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Col, Notification, Row } from "@canonical/react-components";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import ItemName from "components/ItemName";
import { LxdNetwork } from "types/network";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworkState } from "api/networks";
import { humanFileSize } from "util/helpers";
import Loader from "components/Loader";
import { filterUsedByType, LxdUsedBy } from "util/usedBy";
import InstanceLink from "pages/instances/InstanceLink";
import ExpandableList from "components/ExpandableList";

interface Props {
  network: LxdNetwork;
}

const NetworkDetailOverview: FC<Props> = ({ network }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: networkState,
    isLoading,
    error: networkStateError,
    isError: isNetworkStateError,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.state,
    ],
    retry: 0, // physical managed networks can sometimes 404, show error right away and don't retry
    queryFn: () => fetchNetworkState(network.name, project),
  });

  const updateContentHeight = () => {
    updateMaxHeight("network-overview-tab");
  };
  useEffect(updateContentHeight, [project, networkState]);
  useEventListener("resize", updateContentHeight);

  const usageCount = network.used_by?.length ?? 0;

  if (isLoading) {
    return <Loader />;
  }

  const data: Record<string, LxdUsedBy[]> = {
    instances: filterUsedByType("instance", network.used_by),
    profiles: filterUsedByType("profile", network.used_by),
  };

  return (
    <div className="network-overview-tab">
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">Name</th>
                <td>
                  <ItemName item={network} />
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{network.description ? network.description : "-"}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Type</th>
                <td>{network.type}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">State</th>
                <td>{network.status}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">IPv4</th>
                <td>{network.config["ipv4.address"]}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">IPv6</th>
                <td>{network.config["ipv6.address"]}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">Status</h2>
        </Col>
        <Col size={7}>
          {isNetworkStateError && (
            <Notification severity="negative" borderless>
              Could not load network state: {networkStateError.message}
            </Notification>
          )}
          {!isNetworkStateError && (
            <table>
              <tbody>
                <tr className="list-wrapper">
                  <th className="p-muted-heading">RX</th>
                  <td>
                    {humanFileSize(networkState?.counters.bytes_received ?? 0)}{" "}
                    ({networkState?.counters.packets_received ?? 0} packets)
                  </td>
                </tr>
                <tr className="list-wrapper">
                  <th className="p-muted-heading">TX</th>
                  <td>
                    {humanFileSize(networkState?.counters.bytes_sent ?? 0)} (
                    {networkState?.counters.packets_sent ?? 0} packets)
                  </td>
                </tr>
                <tr className="list-wrapper">
                  <th className="p-muted-heading">MAC address</th>
                  <td>{networkState?.hwaddr ?? "-"}</td>
                </tr>
                <tr className="list-wrapper">
                  <th className="p-muted-heading">MTU</th>
                  <td>{networkState?.mtu ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          )}
        </Col>
      </Row>
      <Row className="usage list-wrapper">
        <Col size={3}>
          <h2 className="p-heading--5">Usage ({usageCount})</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr className="list-wrapper">
                <th className="p-muted-heading">
                  Instances ({data.instances.length})
                </th>
                <td>
                  {data.instances.length > 0 ? (
                    <ExpandableList
                      items={data.instances.map((item) => (
                        <div key={item.name}>
                          <InstanceLink instance={item} />
                          {item.project !== project &&
                            ` (project ${item.project})`}
                        </div>
                      ))}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr className="list-wrapper">
                <th className="p-muted-heading">
                  Profiles ({data.profiles.length})
                </th>
                <td>
                  {data.profiles.length > 0 ? (
                    <ExpandableList
                      items={data.profiles.map((item) => (
                        <div key={item.name}>
                          <Link
                            to={`/ui/project/${item.project}/profile/${item.name}`}
                          >
                            {item.name}
                          </Link>
                          {item.project !== project &&
                            ` (project ${item.project})`}
                        </div>
                      ))}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );
};

export default NetworkDetailOverview;
