import type {
  LxdDevices,
  LxdDiskDevice,
  LxdGPUDevice,
  LxdIsoDevice,
  LxdNicDevice,
  LxdOtherDevice,
  LxdProxyDevice,
} from "types/device";
import type { RemoteImage } from "types/image";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";

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
  Required<Pick<LxdDiskDevice, "name">> & {
    limits?: {
      read?: string;
      write?: string;
    };
    bare?: LxdDiskDevice;
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
  | LxdGPUDevice
  | LxdProxyDevice
  | LxdOtherDevice
  | EmptyDevice;

export interface FormDeviceValues {
  devices: FormDevice[];
}

export const isFormDiskDevice = (
  device: FormDevice,
): device is FormDiskDevice => {
  return device.type === "disk";
};

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
      if (item.type === "disk") {
        const { bare, ...rest } = item;
        item = { ...bare, ...rest };
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
        (key) => !["type", "name", "network", "security.acls"].includes(key),
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
          "security.acls": item["security.acls"],
        };
      case "disk":
        return {
          name: key,
          path: "path" in item ? item.path : undefined,
          pool: item.pool,
          source: "source" in item ? item.source : undefined,
          size: "size" in item ? item.size : undefined,
          type: "disk",
          bare: item,
        };
      case "gpu":
      case "proxy":
      case "infiniband":
      case "pci":
      case "tpm":
      case "unix-block":
      case "unix-char":
      case "unix-hotplug":
      case "usb":
        return {
          ...item,
          name: key,
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

export const addNoneDevice = (
  name: string,
  formik: InstanceAndProfileFormikProps,
) => {
  const copy = [...formik.values.devices];
  copy.push({
    type: "none",
    name,
  });
  formik.setFieldValue("devices", copy);
};

export const findNoneDeviceIndex = (
  name: string,
  formik: InstanceAndProfileFormikProps,
) => {
  return formik.values.devices.findIndex(
    (item) => item.name === name && item.type === "none",
  );
};

export const removeDevice = (
  index: number,
  formik: InstanceAndProfileFormikProps,
): void => {
  const copy = [...formik.values.devices];
  copy.splice(index, 1);
  formik.setFieldValue("devices", copy);
};

export const deduplicateName = (
  prefix: string,
  index: number,
  existingNames: string[],
): string => {
  const candidate = `${prefix}-${index}`;
  const hasConflict = existingNames.some((item) => item === candidate);
  if (hasConflict) {
    return deduplicateName(prefix, index + 1, existingNames);
  }
  return candidate;
};
