import { FC } from "react";
import { Select } from "@canonical/react-components";
import Loader from "components/Loader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { fetchProject } from "api/projects";

const UPLINK_NETWORK_TYPES = ["bridge", "physical"];

interface Props {
  isDisabled: boolean;
  project: string;
  props?: Record<string, unknown>;
}

const UplinkSelector: FC<Props> = ({
  isDisabled,
  project: projectName,
  props,
}) => {
  const { data: networks = [], isLoading: isNetworkLoading } = useQuery({
    queryKey: [queryKeys.networks, "default"],
    queryFn: () => fetchNetworks("default"),
  });

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: [queryKeys.projects, projectName],
    queryFn: () => fetchProject(projectName),
  });

  const availableUplinks =
    project?.config?.["restricted.networks.uplinks"]?.split(",") ||
    networks
      .filter((network) => UPLINK_NETWORK_TYPES.includes(network.type))
      .map((network) => network.name);

  const options = availableUplinks.map((name) => {
    return {
      label: name,
      value: name,
    };
  });
  options.unshift({
    label: networks.length === 0 ? "No networks available" : "Select option",
    value: "",
  });

  if (isNetworkLoading || isProjectLoading) {
    return <Loader />;
  }

  return (
    <Select
      label="Uplink"
      help="Uplink network to use for external network access"
      disabled={isDisabled}
      options={options}
      required
      {...props}
    />
  );
};

export default UplinkSelector;
