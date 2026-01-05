import type {
  ConfigurationRowFormikProps,
  ConfigurationRowFormikValues,
} from "components/ConfigurationRow";
import type { FormDevice, FormDeviceValues } from "util/formDevices";
import type { ResourceLimitsFormValues } from "components/forms/ResourceLimitsForm";
import type { InstanceEditDetailsFormValues } from "pages/instances/EditInstance";
import { isRootDisk } from "util/devices";
import isEqual from "lodash.isequal";

const getPrimitiveFieldChanges = (
  formik: ConfigurationRowFormikProps,
): number => {
  let changeCount = 0;

  const ignoredFields = new Set([
    "readOnly",
    "profiles",
    "limits_cpu",
    "limits_memory",
    "devices",
    "barePool",
    "editRestriction",
  ]);

  for (const key in formik.values) {
    if (ignoredFields.has(key)) {
      continue;
    }
    const keyType = key as keyof ConfigurationRowFormikValues;
    if (!isEqual(formik.values[keyType], formik.initialValues[keyType])) {
      changeCount++;
    }
  }

  for (const key in formik.initialValues) {
    if (ignoredFields.has(key) || Object.hasOwn(formik.values, key)) {
      continue;
    }

    const keyType = key as keyof ConfigurationRowFormikValues;
    if (formik.values[keyType] !== formik.initialValues[keyType]) {
      changeCount++;
    }
  }

  return changeCount;
};

const getProfileChanges = (formik: ConfigurationRowFormikProps): number => {
  if (!Object.hasOwn(formik.values, "profiles")) {
    return 0;
  }

  const initProfiles = (formik.initialValues as InstanceEditDetailsFormValues)
    .profiles;
  const profiles = (formik.values as InstanceEditDetailsFormValues).profiles;

  let changeCount = Math.abs(profiles.length - initProfiles.length);
  initProfiles.forEach((initProfile, index) => {
    if (profiles.length > index && initProfile !== profiles[index]) {
      changeCount++;
    }
  });

  return changeCount;
};

const stringifyWithOrder = (value?: object): string => {
  return JSON.stringify(value, Object.keys(value ?? {}).sort());
};

const getLimitChanges = (formik: ConfigurationRowFormikProps): number => {
  let changeCount = 0;

  ["limits_cpu", "limits_memory"].forEach((key) => {
    const keyType = key as "limits_memory" | "limits_cpu";
    const init = (formik.initialValues as ResourceLimitsFormValues)[keyType];

    if (!Object.hasOwn(formik.values, key)) {
      changeCount += init ? 1 : 0;
      return;
    }

    const value = (formik.values as ResourceLimitsFormValues)[keyType];

    if (stringifyWithOrder(init) !== stringifyWithOrder(value)) {
      changeCount++;
    }
  });

  return changeCount;
};

const getDevicePairFieldChanges = (a: FormDevice, b: FormDevice): number => {
  let changeCount = 0;

  for (const key in a) {
    const keyType = key as keyof FormDevice;
    if (isRootDisk(a) && !["size", "pool"].includes(keyType)) {
      continue;
    }

    if (JSON.stringify(a[keyType]) !== JSON.stringify(b[keyType])) {
      changeCount++;
    }
  }
  return changeCount;
};

export const isDeviceModified = (
  formik: ConfigurationRowFormikProps,
  deviceName: string,
): boolean => {
  if (!Object.hasOwn(formik.values, "devices")) {
    return false;
  }

  const initDevices = (formik.initialValues as FormDeviceValues).devices;
  const devices = (formik.values as FormDeviceValues).devices;

  const initDevice = initDevices.find((device) => device.name === deviceName);
  const currentDevice = devices.find((device) => device.name === deviceName);

  // Device is new (not in initial values)
  if (!initDevice && currentDevice) {
    return true;
  }

  // Device was removed or doesn't exist in current values
  if (initDevice && !currentDevice) {
    return false;
  }

  // Both devices exist, check for changes
  if (initDevice && currentDevice) {
    return getDevicePairFieldChanges(initDevice, currentDevice) > 0;
  }

  return false;
};

const getDeviceChanges = (formik: ConfigurationRowFormikProps): number => {
  let changeCount = 0;

  if (!Object.hasOwn(formik.values, "devices")) {
    return 0;
  }

  const initDevices = (formik.initialValues as FormDeviceValues).devices;
  const devices = (formik.values as FormDeviceValues).devices;

  const initNames = initDevices.map((item) => item.name);
  const names = devices.map((item) => item.name);

  let addCount = 0;
  let removeCount = 0;

  const removedDevices: FormDevice[] = [];
  initNames.forEach((init, initIndex) => {
    const valueIndex = names.indexOf(init);
    if (valueIndex === -1) {
      removeCount++;
      removedDevices.push(initDevices[initIndex]);
    } else {
      changeCount += getDevicePairFieldChanges(
        initDevices[initIndex],
        devices[valueIndex],
      );
    }
  });

  names.forEach((init) => {
    const oldIndex = initNames.indexOf(init);
    if (oldIndex === -1) {
      const newDevice = devices.find((device) => device.name === init);
      const oldDevice = removedDevices.find(
        (device) => device.type === newDevice?.type,
      );
      const wasRenamed = !!oldDevice;
      if (wasRenamed && newDevice && oldDevice) {
        // For rename detection, pair an old device if the type is the same and it was removed.
        // subtract -1, because it was already counted as a removal.
        changeCount += getDevicePairFieldChanges(oldDevice, newDevice) - 1;
      } else {
        addCount++;
      }
    }
  });

  return addCount + removeCount + changeCount;
};

export const getFormChangeCount = (formik: ConfigurationRowFormikProps) => {
  return (
    getPrimitiveFieldChanges(formik) +
    getProfileChanges(formik) +
    getLimitChanges(formik) +
    getDeviceChanges(formik)
  );
};
