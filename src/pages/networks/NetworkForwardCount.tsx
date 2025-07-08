import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import { fetchNetworkForwards } from "api/network-forwards";
import { typesWithForwards } from "util/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkForwardCount: FC<Props> = ({ network, project }) => {
  if (network.managed === false || !typesWithForwards.includes(network.type)) {
    return <>-</>;
  }

  const { data: forwards = [], isLoading } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network,
      queryKeys.forwards,
    ],
    queryFn: async () => fetchNetworkForwards(network.name, project),
  });

  return <>{isLoading ? "" : forwards.length}</>;
};

export default NetworkForwardCount;
