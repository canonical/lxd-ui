import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchNetworks } from "api/networks";
import { queryKeys } from "util/queryKeys";
import { LxdNicDevice } from "types/device";
import Loader from "components/Loader";
import useNotify from "util/useNotify";

interface Props {
  nicDevice: LxdNicDevice;
  project: string;
  setNicDevice: (nicDevice: LxdNicDevice) => void;
}

const NetworkSelector: FC<Props> = ({ nicDevice, project, setNicDevice }) => {
  const notify = useNotify();
  const {
    data: networks = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  if (isLoading) {
    return <Loader text="Loading networks..." />;
  }

  if (error) {
    notify.failure("Could not load networks.", error);
  }

  const getNetworkOptions = () => {
    const options = networks.map((network) => {
      return {
        label: network.name,
        value: network.name,
        disabled: false,
      };
    });
    options.unshift({
      label: networks.length === 0 ? "No networks available" : "Select option",
      value: "",
      disabled: true,
    });
    return options;
  };

  return (
    <>
      <Select
        name="nic"
        label="Network device"
        options={getNetworkOptions()}
        onChange={(e) =>
          setNicDevice({ ...nicDevice, network: e.target.value })
        }
        value={nicDevice.network}
        stacked
      />
      <Input
        id="nameInInstance"
        name="nameInInstance"
        type="text"
        label="Name in instance"
        placeholder="e.g. eth0"
        help="Network name will be used if left blank."
        onChange={(e) => setNicDevice({ ...nicDevice, name: e.target.value })}
        value={nicDevice.name}
        stacked
      />
    </>
  );
};

export default NetworkSelector;
