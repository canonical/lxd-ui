import type { FormDevice, FormDiskDevice } from "types/formDevice";
import type { LxdDevices, LxdNicDevice } from "types/device";
import type { RemoteImage } from "types/image";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import { focusField } from "util/formFields";
import { isCustomNic } from "util/devices";

export const isFormDiskDevice = (
  device: FormDevice,
): device is FormDiskDevice => {
  return device.type === "disk";
};

export const isCustomNicFormDevice = (
  device: FormDevice,
): device is FormDevice & { type: "custom-nic"; bare: LxdNicDevice } => {
  if (device.type !== "custom-nic") return false;
  return isCustomNic(device.bare);
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

    if (isCustomNic(item)) {
      return {
        name: key,
        bare: item as LxdNicDevice,
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
          "ipv4.address": item["ipv4.address"],
          "ipv6.address": item["ipv6.address"],
          network: item.network,
          type: "nic",
          "security.acls": item["security.acls"],
          "security.acls.default.egress.action":
            item["security.acls.default.egress.action"],
          "security.acls.default.ingress.action":
            item["security.acls.default.ingress.action"],
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
  const copy = [...formik.values.devices].filter((t) => t.name !== name);
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

export const addNicDevice = ({
  formik,
  deviceName,
  deviceNetworkName,
}: {
  formik: InstanceAndProfileFormikProps;
  deviceName: string;
  deviceNetworkName: string;
}) => {
  const copy = [...formik.values.devices].filter((t) => t.name !== deviceName);
  copy.push({
    type: "nic",
    name: deviceName,
    network: deviceNetworkName,
  });
  formik.setFieldValue("devices", copy);
  return copy.length;
};

export const focusNicDevice = (id: number) => {
  focusField(`devices.${id}.network`);
};

export const removeNicDevice = ({
  formik,
  deviceName,
}: {
  formik: InstanceAndProfileFormikProps;
  deviceName: string;
}) => {
  const copy = [...formik.values.devices].filter((t) => t.name !== deviceName);
  formik.setFieldValue("devices", copy);
};
