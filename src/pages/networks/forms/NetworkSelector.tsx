import React, { FC } from "react";
import { Select } from "@canonical/react-components";
import Loader from "components/Loader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";

interface Props {
  isDisabled: boolean;
  project: string;
  props?: Record<string, unknown>;
}

const NetworkSelector: FC<Props> = ({ isDisabled, project, props }) => {
  const { data: networks = [], isLoading } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  const options = networks.map((network) => {
    return {
      label: network.name,
      value: network.name,
    };
  });
  options.unshift({
    label: networks.length === 0 ? "No networks available" : "Select option",
    value: "",
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Select
      label="Uplink"
      help="Uplink network to use for external network access"
      disabled={isDisabled}
      options={options}
      {...props}
    />
  );
};

export default NetworkSelector;
