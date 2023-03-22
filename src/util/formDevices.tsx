import { LxdDevices, LxdDiskDevice, LxdNicDevice } from "types/device";

interface EmptyDevice {
  type: "";
  name: string;
}

interface UnknownDevice {
  type: "unknown";
  name: string;
  bare: string;
}

export type FormDevice =
  | (Partial<LxdDiskDevice> & Required<Pick<LxdDiskDevice, "name">>)
  | (Partial<LxdNicDevice> & Required<Pick<LxdNicDevice, "name">>)
  | UnknownDevice
  | EmptyDevice;

export interface FormDeviceValues {
  devices: FormDevice[];
}

export const isEmptyDevice = (device: FormDevice) =>
  device.type === "nic" &&
  device.name.length === 0 &&
  (device.network?.length ?? 0) === 0;

export const formDeviceToPayload = (devices: FormDevice[]) => {
  return devices
    .filter((item) => !isEmptyDevice(item))
    .reduce((obj, { name, ...item }) => {
      if (item.type === "unknown") {
        return {
          [name]: item.bare,
        };
      }
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
          name: key,
          bare: item,
          type: "unknown",
        };
    }
  });
};
