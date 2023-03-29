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
  onFailure: (message: string, e: unknown) => void;
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
    onFailure("Could not load networks.", error);
  }

  const instanceNetworks = Object.values(instance.expanded_devices)
    .filter(isNicDevice)
    .map((network) => network.network);

  const networksHeaders = [
    { content: "Name", sortKey: "name", className: "p-muted-heading" },
    { content: "Type", sortKey: "type", className: "p-muted-heading" },
    { content: "Managed", sortKey: "managed", className: "p-muted-heading" },
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
        ],
        sortData: {
          name: network.name,
          type: network.type,
          managed: network.managed,
        },
      };
    });

  return (
    <>
      {isLoading ? (
        <Loader text="Loading networks..." />
      ) : (
        <MainTable headers={networksHeaders} rows={networksRows} sortable />
      )}
    </>
  );
};

export default InstanceOverviewNetworks;
