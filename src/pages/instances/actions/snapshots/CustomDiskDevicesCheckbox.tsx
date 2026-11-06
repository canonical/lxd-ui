import type { ChangeEvent, FC, ReactNode } from "react";
import { CheckboxInput, List } from "@canonical/react-components";

interface Props {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  includedDevices: string[];
  allDevices: string[];
  help?: ReactNode;
}

const CustomDiskDevicesCheckbox: FC<Props> = ({
  id,
  label,
  checked,
  onChange,
  includedDevices,
  allDevices,
  help,
}) => {
  const ignoredDevices = allDevices.filter(
    (device) => !includedDevices.includes(device),
  );

  const deviceList = (title: string, devices: string[]) =>
    devices.length > 0 && (
      <div className="custom-disk-devices__row">
        <span className="custom-disk-devices__title">{title}</span>
        <List inline middot items={devices} className="u-no-margin--bottom" />
      </div>
    );

  return (
    <>
      <CheckboxInput
        id={id}
        label={label}
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.checked);
        }}
        help={help}
      />
      {checked && (
        <div className="custom-disk-devices">
          {deviceList("Included:", includedDevices)}
          {deviceList("Ignored:", ignoredDevices)}
        </div>
      )}
    </>
  );
};

export default CustomDiskDevicesCheckbox;
