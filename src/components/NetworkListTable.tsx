import type { FC } from "react";
import { MainTable, Notification, Spinner } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { isNicDevice } from "util/devices";
import ResourceLink from "components/ResourceLink";
import { Link, useParams } from "react-router-dom";
import type { LxdDevices } from "types/device";
import { useNetworks } from "context/useNetworks";
import type { LxdInstance } from "types/instance";

interface Props {
  onFailure: (title: string, e: unknown) => void;
  devices: LxdDevices;
  instance?: LxdInstance;
  profileName?: string;
}

const NetworkListTable: FC<Props> = ({
  onFailure,
  devices,
  instance,
  profileName,
}) => {
  const { project } = useParams<{ project: string }>();

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
  ];

  const lxdNetworks = Object.entries(devices ?? {})
    .map(([_, networkDevice]) => {
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

      return network;
    })
    .filter((network) => network !== null);

  const shouldDisplayAclsColumn = lxdNetworks.some(
    (t) => t.config["security.acls"],
  );

  if (shouldDisplayAclsColumn) {
    networksHeaders.push({
      content: "ACLs",
      sortKey: "acls",
      className: "u-text--muted u-hide--small u-hide--medium",
    });
  }

  const networksRows: MainTableRow[] = Object.entries(devices ?? {})
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
      const deviceAcls =
        device && device["security.acls"] ? device["security.acls"] : "";
      const networkAcls = network.config["security.acls"] ?? "";
      const aclsCount = new Set(
        deviceAcls
          .split(",")
          .filter((t) => t)
          .concat(networkAcls.split(",").filter((t) => t)),
      ).size;

      const columns = [
        {
          content: (
            <ResourceLink
              type="network"
              value={network.name}
              to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(network.name)}`}
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
        },
      ];

      const baseUrl = `/ui/project/${encodeURIComponent(project ?? "")}/`;
      const urlSuffix = "/configuration/network";
      const linkToConfiguration = instance
        ? `${baseUrl}instance/${encodeURIComponent(instance.name)}${urlSuffix}`
        : profileName
          ? `${baseUrl}profile/${encodeURIComponent(profileName)}${urlSuffix}`
          : "";

      if (shouldDisplayAclsColumn) {
        columns.push({
          content:
            aclsCount > 0 ? (
              <Link to={linkToConfiguration}>{aclsCount}</Link>
            ) : (
              <>-</>
            ),
          role: "cell",
          "aria-label": "ACLs count",
        });
      }

      return {
        key: network.name,
        columns,
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type + network.managed ? "managed" : "unmanaged",
          interfaceName: deviceName.toLowerCase(),
          macAddress:
            instance?.config?.[`volatile.${deviceName}.hwaddr`] || "-",
        },
      };
    })
    .filter((row) => row !== null);

  const getContent = () => {
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
        sortable
        className={"network-table"}
      />
    );
  };

  return getContent();
};

export default NetworkListTable;
