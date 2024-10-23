import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable } from "@canonical/react-components";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { fetchNetworks } from "api/networks";
import { isNicDevice } from "util/devices";
import ResourceLink from "components/ResourceLink";
import { LxdProfile } from "types/profile";
import { useParams } from "react-router-dom";

interface Props {
  onFailure: (title: string, e: unknown) => void;
  instance?: LxdInstance;
  profile?: LxdProfile;
}

const NetworkListTable: FC<Props> = ({ instance, profile, onFailure }) => {
  const { project } = useParams<{ project: string }>();

  const overviewType = {
    project: project,
    devices: instance ? instance.expanded_devices : profile?.devices,
  };

  const {
    data: networks = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, overviewType.project, queryKeys.networks],
    queryFn: () => fetchNetworks(overviewType.project as string),
  });

  if (error) {
    onFailure("Loading networks failed", error);
  }

  const overviewNetworks = Object.values(overviewType.devices ?? {})
    .filter(isNicDevice)
    .map((network) => network.network);

  const hasNetworks = overviewNetworks.length > 0;

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
    .filter((network) => overviewNetworks.includes(network.name))
    .map((network) => {
      const interfaceNames = Object.entries(overviewType.devices ?? {})
        .filter(
          ([_key, value]) =>
            value.type === "nic" && value.network === network.name,
        )
        .map(([key]) => key);

      return {
        columns: [
          {
            content: (
              <ResourceLink
                type="network"
                value={network.name}
                to={`/ui/project/${overviewType.project}/network/${network.name}`}
              />
            ),
            role: "rowheader",
            "aria-label": "Name",
          },
          {
            content: interfaceNames.length > 0 ? interfaceNames.join(" ") : "-",
            role: "rowheader",
            "aria-label": "Interface",
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
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type,
          managed: network.managed,
          interfaceName: interfaceNames.join(" "),
        },
      };
    });

  return (
    <>
      {isLoading && <Loader text="Loading networks..." />}
      {!isLoading && hasNetworks && (
        <MainTable headers={networksHeaders} rows={networksRows} sortable />
      )}
      {!isLoading && !hasNetworks && <>-</>}
    </>
  );
};

export default NetworkListTable;
