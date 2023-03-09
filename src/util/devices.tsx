import { LxdDevices, LxdDiskDevice, LxdNicDevice } from "types/device";
import { FormDevice } from "pages/instances/forms/DevicesForm";

export const isNicDevice = (
  device: LxdDiskDevice | LxdNicDevice
): device is LxdNicDevice => device.type === "nic";

export const isDiskDevice = (
  device: LxdDiskDevice | LxdNicDevice
): device is LxdDiskDevice => device.type === "disk";

export const formDeviceToPayload = (devices: FormDevice[]) => {
  return devices
    .filter((item) => item.type !== "")
    .reduce((obj, { name, ...item }) => {
      return {
        ...obj,
        [name]: item,
      };
    }, {});
};

export const parseDevices = (devices: LxdDevices): FormDevice[] => {
  return Object.keys(devices).map((key) => {
    const item = devices[key];
    switch (item.type) {
      case "nic":
        return {
          name: key,
          network: item.network,
          type: "nic",
        };
      case "disk":
        return {
          name: key,
          path: item.path,
          pool: item.pool,
          size: item.size,
          type: "disk",
        };
      default:
        return {
          type: "",
          name: "",
        };
    }
  });
};
