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
  networkList: LxdNetwork[];
  hasNoneOption?: boolean;
}

const NetworkSelector: FC<
  Props & Omit<CustomSelectProps, "onChange" | "options" | "value">
> = ({
  value,
  setValue,
  networkList,
  hasNoneOption = false,
  ...selectProps
}) => {
  const getNetworkOptions = () => {
    const options: CustomSelectOption[] = networkList.map((network) => {
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
        text: "None",
        disabled: true,
      });
    }

    if (hasNoneOption) {
      options.push({
        label: (
          <div className="label">
            <span title="No network" className="network-option u-truncate">
              No network
            </span>
            <span title="No network type" className="network-option u-truncate">
              -
            </span>
            <span
              title="network ACLs"
              className="network-option u-truncate u-align--right"
            >
              -
            </span>
          </div>
        ),
        value: "none",
        text: "No network",
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
        <span className="network-option u-no-margin--bottom u-align--right">
          ACLs
        </span>
      </div>
    );
  };

  return (
    <CustomSelect
      label="Network"
      {...selectProps}
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
