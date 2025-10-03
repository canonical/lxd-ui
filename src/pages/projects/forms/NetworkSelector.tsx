import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import type {
  CustomSelectOption,
  CustomSelectProps,
} from "@canonical/react-components";
import { getNetworkAcls } from "util/networks";
import type { LxdNetwork } from "types/network";

interface Props {
  value: string;
  setValue: (value: string) => void;
  managedNetworks: LxdNetwork[];
  hasNoneOption?: boolean;
}

const NetworkSelector: FC<
  Props & Omit<CustomSelectProps, "onChange" | "options" | "value">
> = ({
  value,
  setValue,
  managedNetworks,
  hasNoneOption = false,
  ...selectProps
}) => {
  const getNetworkOptions = () => {
    const options: CustomSelectOption[] = managedNetworks.map((network) => {
      return {
        label: (
          <div className="label">
            <span title={network.name} className="network-option u-truncate">
              {network.name}
            </span>
            <span title={network.type} className="network-option u-truncate">
              {network.type}
            </span>
            <span
              title="network ACLs"
              className="network-option u-truncate u-align--right"
            >
              {getNetworkAcls(network).length || "-"}
            </span>
          </div>
        ),
        value: network.name,
        text: `${network.name} - ${network.type}`,
        disabled: false,
        selectedLabel: (
          <span>
            {network.name}&nbsp;
            <span className="u-text--muted">&#40;{network.type}&#41;</span>
          </span>
        ),
      };
    });

    if (options.length === 0) {
      options.unshift({
        label: <span>No networks available</span>,
        value: "",
        text: "",
        disabled: true,
      });
    }

    if (hasNoneOption) {
      options.push({
        label: <span>No network</span>,
        value: "none",
        text: "none",
        disabled: false,
      });
    }

    return options;
  };

  const getHeader = () => {
    return (
      <div className="header">
        <span className="network-option u-no-margin--bottom">Name</span>
        <span className="network-option u-no-margin--bottom">Type</span>
        <span className="network-option u-no-margin--bottom">ACLs</span>
      </div>
    );
  };

  return (
    <CustomSelect
      {...selectProps}
      label="Network"
      onChange={(e) => {
        setValue(e);
      }}
      value={value}
      options={getNetworkOptions()}
      header={getHeader()}
      dropdownClassName="network-select-dropdown"
      aria-label="Network"
    />
  );
};

export default NetworkSelector;
