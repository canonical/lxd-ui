import type { ChangeEvent, FC, ReactNode } from "react";
import { CheckboxInput, List } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { getCustomVolumeDeviceLabel } from "util/instanceSnapshots";
import DsIcon from "components/DsIcon";

interface Props {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  instance: LxdInstance;
  includedDevices: string[];
  allDevices: string[];
  isLoading?: boolean;
  isUnknown?: boolean;
  disabled?: boolean;
  help?: ReactNode;
}

const CustomDiskDevicesCheckbox: FC<Props> = ({
  id,
  label,
  checked,
  onChange,
  instance,
  includedDevices,
  allDevices,
  isLoading,
  isUnknown,
  disabled,
  help,
}) => {
  const notIncludedDevices = allDevices.filter(
    (device) => !includedDevices.includes(device),
  );

  const getDevices = (devices: string[]) => {
    if (isLoading) {
      return <DsIcon className="u-animation--spin" icon="spinner" />;
    }
    if (isUnknown) {
      return "Unknown";
    }
    if (devices.length === 0) {
      return "-";
    }
    return (
      <List
        inline
        className="custom-disk-devices__list"
        items={devices.map((device) =>
          getCustomVolumeDeviceLabel(instance, device),
        )}
      />
    );
  };

  const deviceList = (title: string, devices: string[]) => (
    <div className="custom-disk-devices__row">
      {title} {getDevices(devices)}
    </div>
  );

  return (
    <>
      <CheckboxInput
        id={id}
        label={label}
        checked={checked}
        disabled={disabled}
        className="snapshot-disabled-checkbox"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.checked);
        }}
        help={help}
      />
      {checked && !disabled && (
        <div className="custom-disk-devices">
          {deviceList("Included:", includedDevices)}
          {deviceList("Not included:", notIncludedDevices)}
        </div>
      )}
    </>
  );
};

export default CustomDiskDevicesCheckbox;
