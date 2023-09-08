import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable } from "@canonical/react-components";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { Link } from "react-router-dom";
import { fetchNetworks } from "api/networks";
import { isNicDevice } from "util/devices";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewNetworks: FC<Props> = ({ instance, onFailure }) => {
  const {
    data: networks = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.networks, instance.project],
    queryFn: () => fetchNetworks(instance.project),
  });

  if (error) {
    onFailure("Loading networks failed", error);
  }

  const instanceNetworks = Object.values(instance.expanded_devices ?? {})
    .filter(isNicDevice)
    .map((network) => network.network);

  const hasNetworks = instanceNetworks.length > 0;

  const networksHeaders = [
    { content: "Name", sortKey: "name", className: "p-muted-heading" },
    {
      content: "Interface",
      sortKey: "interfaceName",
      className: "p-muted-heading",
    },
    { content: "Type", sortKey: "type", className: "p-muted-heading" },
    {
      content: "Managed",
      sortKey: "managed",
      className: "p-muted-heading u-hide--small u-hide--medium",
    },
  ];

  const networksRows = networks
    .filter((network) => instanceNetworks.includes(network.name))
    .map((network) => {
      const interfaceNames = Object.entries(instance.expanded_devices ?? {})
        .filter(
          ([_key, value]) =>
            value.type === "nic" && value.network === network.name
        )
        .map(([key]) => key);

      return {
        columns: [
          {
            content: (
              // TODO: fix this link to point to the network detail page
              <Link
                to={`/ui/project/${instance.project}/networks`}
                title={network.name}
              >
                {network.name}
              </Link>
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

export default InstanceOverviewNetworks;
