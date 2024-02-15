import {
  LxdDevices,
  LxdDiskDevice,
  LxdIsoDevice,
  LxdNicDevice,
} from "types/device";
import { RemoteImage } from "types/image";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";

interface EmptyDevice {
  type: "";
  name: string;
}

interface UnknownDevice {
  type: "unknown";
  name: string;
  bare: unknown;
}

interface NoneDevice {
  type: "none";
  name: string;
}

export interface IsoVolumeDevice {
  type: "iso-volume";
  name: string;
  bare: LxdIsoDevice;
}

export interface CustomNetworkDevice {
  type: "custom-nic";
  name: string;
  bare: LxdNicDevice;
}

export type FormDiskDevice = Partial<LxdDiskDevice> &
  Required<Pick<LxdDiskDevice, "name" | "pool">> & {
    limits?: {
      read?: string;
      write?: string;
    };
  };

export type FormNetworkDevice = Partial<LxdNicDevice> &
  Required<Pick<LxdNicDevice, "name">>;

export type FormDevice =
  | FormDiskDevice
  | FormNetworkDevice
  | UnknownDevice
  | NoneDevice
  | CustomNetworkDevice
  | IsoVolumeDevice
  | EmptyDevice;

export interface FormDeviceValues {
  devices: FormDevice[];
}

export const isEmptyDevice = (device: FormDevice): boolean =>
  device.type === "nic" &&
  device.name.length === 0 &&
  (device.network?.length ?? 0) === 0;

export const formDeviceToPayload = (devices: FormDevice[]) => {
  return devices
    .filter((item) => !isEmptyDevice(item))
    .reduce((obj, { name, ...item }) => {
      if (
        item.type === "unknown" ||
        item.type === "custom-nic" ||
        item.type === "iso-volume"
      ) {
        return {
          ...obj,
          [name]: item.bare,
        };
      }
      if ("limits" in item) {
        if (item.limits?.read) {
          item["limits.read"] = item.limits.read;
        }
        if (item.limits?.write) {
          item["limits.write"] = item.limits.write;
        }
        delete item.limits;
      }
      if ("size" in item && !item.size?.match(/^\d/)) {
        delete item.size;
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

    const isCustomNetwork =
      item.type === "nic" &&
      Object.keys(item).some(
        (key) => !["type", "name", "network"].includes(key),
      );

    if (isCustomNetwork) {
      return {
        name: key,
        bare: item,
        type: "custom-nic",
      };
    }

    if (key === "iso-volume") {
      return {
        name: key,
        bare: item as unknown,
        type: "unknown",
      };
    }

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
          path: "path" in item ? item.path : undefined,
          pool: item.pool,
          source: "source" in item ? item.source : undefined,
          size: "size" in item ? item.size : undefined,
          limits: {
            read: "limits.read" in item ? item["limits.read"] : undefined,
            write: "limits.write" in item ? item["limits.write"] : undefined,
          },
          type: "disk",
        };
      case "none":
        return {
          name: key,
          type: "none",
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

export const remoteImageToIsoDevice = (image: RemoteImage): FormDevice => {
  return {
    type: "iso-volume",
    name: "iso-volume",
    bare: {
      "boot.priority": "10",
      pool: image.pool ?? "",
      source: image.aliases,
      type: "disk",
    },
  };
};

export const removeDevice = (
  index: number,
  formik: InstanceAndProfileFormikProps,
): void => {
  const copy = [...formik.values.devices];
  copy.splice(index, 1);
  void formik.setFieldValue("devices", copy);
};
