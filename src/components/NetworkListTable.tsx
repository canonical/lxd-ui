import type { FC } from "react";
import { MainTable, Notification } from "@canonical/react-components";
import Loader from "components/Loader";
import { isNicDevice } from "util/devices";
import ResourceLink from "components/ResourceLink";
import { useParams } from "react-router-dom";
import type { LxdDevices } from "types/device";
import { useNetworks } from "context/useNetworks";

interface Props {
  onFailure: (title: string, e: unknown) => void;
  devices: LxdDevices;
}

const NetworkListTable: FC<Props> = ({ onFailure, devices }) => {
  const { project } = useParams<{ project: string }>();

  const {
    data: networks = [],
    error,
    isLoading,
  } = useNetworks(project as string);

  if (error) {
    onFailure("Loading networks failed", error);
  }

  const networkDevices = Object.values(devices ?? {})
    .filter(isNicDevice)
    .map((network) => network.network);

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
      content: "Managed",
      sortKey: "managed",
      className: "u-text--muted u-hide--small u-hide--medium",
    },
  ];

  const networksRows = networks
    .filter((network) => networkDevices.includes(network.name))
    .map((network) => {
      const interfaceNames = Object.entries(devices ?? {})
        .filter(
          ([_key, value]) =>
            value.type === "nic" && value.network === network.name,
        )
        .map(([key]) => key);

      return {
        key: network.name,
        columns: [
          {
            content: (
              <ResourceLink
                type="network"
                value={network.name}
                to={`/ui/project/${project}/network/${network.name}`}
              />
            ),
            role: "cell",
            "aria-label": "Name",
          },
          {
            content: interfaceNames.length > 0 ? interfaceNames.join(" ") : "-",
            role: "cell",
            "aria-label": "Interface",
          },
          {
            content: network.type,
            role: "cell",
            "aria-label": "Type",
          },
          {
            content: network.managed ? "Yes" : "No",
            role: "cell",
            "aria-label": "Managed",
          },
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type,
          managed: network.managed,
          interfaceName: interfaceNames.join(" "),
        },
      };
    });

  const getContent = () => {
    if (isLoading) {
      return <Loader text="Loading networks..." />;
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
