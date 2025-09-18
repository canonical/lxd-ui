import type { FC } from "react";
import { MainTable, Notification, Spinner } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { isNicDevice } from "util/devices";
import ResourceLink from "components/ResourceLink";
import ExpandableList from "components/ExpandableList";
import { useParams } from "react-router-dom";
import type { LxdDevices } from "types/device";
import { useNetworks } from "context/useNetworks";
import type { LxdInstance } from "types/instance";

interface Props {
  onFailure: (title: string, e: unknown) => void;
  devices: LxdDevices;
  instance?: LxdInstance;
}

const NetworkListTable: FC<Props> = ({ onFailure, devices, instance }) => {
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

  const canHaveAcls = lxdNetworks.some((t) => t.type === "ovn");

  if (canHaveAcls) {
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

      const find = networkDevices.find((t) => t.network === network.name);
      const instanceAcls =
        find && find["security.acls"] ? find["security.acls"] : "";
      const networkAcls = network.config["security.acls"] ?? "";
      const acls = instanceAcls
        .split(",")
        .map((t) => {
          return {
            name: t,
            source: "instance",
          };
        })
        .concat(
          networkAcls.split(",").map((t) => {
            return {
              name: t,
              source: "network",
            };
          }),
        );

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

      if (canHaveAcls) {
        columns.push({
          content: acls ? (
            <ExpandableList
              items={acls.map((acl) => (
                <div key={acl.name} className="u-whitespace-nowrap">
                  <ResourceLink
                    type="network-acl"
                    value={acl.name}
                    to={`/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl.name)}`}
                  />
                  <span className="u-text--muted p-text--x-small">
                    &nbsp;({acl.source})
                  </span>
                </div>
              ))}
            />
          ) : (
            <>-</>
          ), // TODO: wrong, we want acls attached to the instance or profile, not the network
          role: "cell",
          "aria-label": "ACLs",
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
