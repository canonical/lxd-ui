import type { FC } from "react";
import { MainTable, Notification, Spinner } from "@canonical/react-components";
import { getDeviceAcls, isNicDevice } from "util/devices";
import { getNetworkAcls, typesWithLoadBalancers } from "util/networks";
import { Link, useParams } from "react-router-dom";
import type { LxdDevices } from "types/device";
import { useNetworks } from "context/useNetworks";
import type { LxdInstance } from "types/instance";
import NetworkRichChip from "pages/networks/NetworkRichChip";
import InstanceLoadBalancerTable from "components/InstanceLoadBalancerTable";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  onFailure: (title: string, e: unknown) => void;
  devices: LxdDevices;
  instance?: LxdInstance;
}

const NetworkListTable: FC<Props> = ({ onFailure, devices, instance }) => {
  const { project } = useParams<{ project: string }>();
  const { hasLoadBalancerPools } = useSupportedFeatures();

  const {
    data: networks = [],
    error,
    isLoading,
  } = useNetworks(project as string);

  if (error) {
    onFailure("Loading networks failed", error);
  }

  const networkDevices = Object.values(devices ?? {}).filter(isNicDevice);
  const instanceHasNetworks = networkDevices.length > 0;
  const userHasNetworks = networks.length > 0;

  const networksHeaders = [
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    {
      content: "Interface",
      sortKey: "interfaceName",
      className: "u-text--muted",
    },
    { content: "Type", sortKey: "type", className: "u-text--muted" },
    {
      content: "MAC address",
      sortKey: "macAddress",
      className: "u-text--muted u-hide--small u-hide--medium",
    },
    {
      content: "ACLs",
      sortKey: "acls",
      className: "u-text--muted u-hide--small u-hide--medium",
    },
  ];

  const networksRows = Object.entries(devices ?? {})
    .map(([deviceName, networkDevice]) => {
      if (networkDevice.type !== "nic") {
        return null;
      }

      const network = networks.find(
        (item) =>
          item.name === networkDevice.network ||
          item.name === networkDevice.parent,
      );

      if (!network) {
        return null;
      }

      const device = networkDevices.find((t) => t.network === network.name);
      const deviceAcls = getDeviceAcls(device);
      const networkAcls = getNetworkAcls(network);
      const aclsCount = new Set(deviceAcls.concat(networkAcls)).size;
      const hasLoadBalancers =
        !!instance &&
        hasLoadBalancerPools &&
        typesWithLoadBalancers.includes(network.type);

      return {
        key: network.name,
        className: "u-row",
        columns: [
          {
            content: (
              <NetworkRichChip
                networkName={network.name}
                projectName={project ?? ""}
              />
            ),
            role: "rowheader",
            "aria-label": "Name",
          },
          {
            content: deviceName,
            role: "cell",
            "aria-label": "Interface",
          },
          {
            content: (
              <>
                {network.type}
                <span className="u-text--muted">
                  , {network.managed ? "managed" : "unmanaged"}
                </span>
              </>
            ),
            role: "cell",
            "aria-label": "Type",
          },
          {
            content: instance?.config?.[`volatile.${deviceName}.hwaddr`] || "-",
            role: "cell",
            "aria-label": "MAC address",
            className: "u-hide--small u-hide--medium",
          },
          {
            content:
              aclsCount > 0 ? (
                <Link to="configuration/network">{aclsCount}</Link>
              ) : (
                <>-</>
              ),
            role: "cell",
            "aria-label": "ACLs count",
            className: "u-hide--small u-hide--medium",
          },
        ],
        expanded: hasLoadBalancers,
        expandedContent: hasLoadBalancers && (
          <div className="instance-load-balancers">
            <InstanceLoadBalancerTable
              device={networkDevice}
              instance={instance}
            />
          </div>
        ),
        sortData: {
          name: network.name.toLowerCase(),
          type: `${network.type} ${network.managed ? "managed" : "unmanaged"}`,
          interfaceName: deviceName.toLowerCase(),
          macAddress:
            instance?.config?.[`volatile.${deviceName}.hwaddr`] || "-",
          acls: aclsCount,
        },
      };
    })
    .filter((row) => row !== null);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading networks..." />;
  }

  if (instanceHasNetworks && !userHasNetworks) {
    return (
      <Notification severity="caution" title="Restricted permissions">
        You do not have permission to view network details.
      </Notification>
    );
  }

  if (!instanceHasNetworks) {
    return <>-</>;
  }

  return (
    <MainTable
      headers={networksHeaders}
      rows={networksRows}
      className="network-list-table"
      sortable
      expanding
    />
  );
};

export default NetworkListTable;
