import { Select } from "@canonical/react-components";
import type { SelectProps } from "@canonical/react-components";
import type { FC } from "react";
import { useNetworks } from "context/useNetworks";

interface Props {
  value: string;
  project: string;
  setValue: (value: string) => void;
  onBlur?: (e: React.FocusEvent) => void;
  hasNoneOption?: boolean;
}

const NetworkSelector: FC<Props & SelectProps> = ({
  value,
  project,
  setValue,
  onBlur,
  hasNoneOption = false,
  ...selectProps
}) => {
  const { data: networks = [] } = useNetworks(project);

  const managedNetworks = networks.filter((network) => network.managed);

  const getNetworkOptions = () => {
    const options = managedNetworks.map((network) => {
      return {
        label: network.name,
        value: network.name,
        disabled: false,
      };
    });

    options.unshift({
      label: options.length === 0 ? "No networks available" : "Select option",
      value: "",
      disabled: true,
    });

    if (hasNoneOption) {
      options.push({ label: "No network", value: "none", disabled: false });
    }

    return options;
  };
  return (
    <Select
      label="Network"
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={onBlur}
      value={value}
      {...selectProps}
      options={getNetworkOptions()}
    />
  );
};

export default NetworkSelector;
