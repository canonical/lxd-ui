import type { FC } from "react";
import { List } from "@canonical/react-components";
import type { LxdDeviceValue } from "types/device";
import {
  isNicDevice,
  isDiskDevice,
  isGPUDevice,
  isOtherDevice,
  isProxyDevice,
  isRootDisk,
  isVolumeDevice,
} from "util/devices";
import type { FormDevice } from "util/formDevices";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  devices: LxdDeviceValue[];
  maxWidth?: number;
}

const DevicesSummaryList: FC<Props> = ({ devices }) => {
  const devicesOtherThanNic = devices.filter((device) => !isNicDevice(device));
  const deviceCounts: Record<string, number> = {};

  devicesOtherThanNic.forEach((device) => {
    if (isDiskDevice(device)) {
      if (isRootDisk(device as unknown as FormDevice)) {
        return;
      } else if (isVolumeDevice(device)) {
        deviceCounts.volume = (deviceCounts.volume || 0) + 1;
      } else {
        deviceCounts.disk = (deviceCounts.disk || 0) + 1;
      }
    } else if (isGPUDevice(device)) {
      deviceCounts.gpu = (deviceCounts.gpu || 0) + 1;
    } else if (isProxyDevice(device)) {
      deviceCounts.proxy = (deviceCounts.proxy || 0) + 1;
    } else if (isOtherDevice(device)) {
      deviceCounts.other = (deviceCounts.other || 0) + 1;
    }
  });

  // Convert counts to readable strings
  const deviceTypeLabels: Record<string, string> = {
    volume: "Volume",
    disk: "Disk",
    gpu: "GPU",
    proxy: "Proxy",
    other: "Other",
  };

  // Define order to match menu
  const deviceTypeOrder = ["volume", "disk", "gpu", "proxy", "other"];

  const deviceItems = deviceTypeOrder
    .filter((type) => deviceCounts[type] > 0)
    .map((type) => {
      const count = deviceCounts[type];
      const label = deviceTypeLabels[type] || type;
      return `${count} ${pluralize(label, count)}`;
    });

  return deviceItems.length > 0 ? (
    <List
      items={deviceItems}
      middot
      className="u-no-margin devices-summary-list"
      title={deviceItems.join(", ")}
    />
  ) : (
    "-"
  );
};

export default DevicesSummaryList;
