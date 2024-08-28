import { FC } from "react";
import { Select } from "@canonical/react-components";
import Loader from "components/Loader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { useParams } from "react-router-dom";

interface Props {
  props?: Record<string, unknown>;
}

const NetworkParentSelector: FC<Props> = ({ props }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: networks = [], isLoading: isNetworkLoading } = useQuery({
    queryKey: [queryKeys.networks, project],
    queryFn: () => fetchNetworks(project),
  });

  const options = networks
    .filter((network) => network.managed === false)
    .map((network) => {
      return {
        label: network.name,
        value: network.name,
      };
    });
  options.unshift({
    label: networks.length === 0 ? "No networks available" : "Select option",
    value: "",
  });

  if (isNetworkLoading) {
    return <Loader />;
  }

  return (
    <Select
      label="Parent"
      help="Existing interface to use for network"
      options={options}
      required
      {...props}
    />
  );
};

export default NetworkParentSelector;
