import {
  ConfigurationRowFormikProps,
  ConfigurationRowFormikValues,
} from "components/ConfigurationRow";
import { FormDevice, FormDeviceValues } from "util/formDevices";
import { ResourceLimitsFormValues } from "components/forms/ResourceLimitsForm";
import { InstanceEditDetailsFormValues } from "pages/instances/EditInstance";
import { isRootDisk } from "util/instanceValidation";

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
  ]);

  for (const key in formik.values) {
    if (ignoredFields.has(key)) {
      continue;
    }
    const keyType = key as keyof ConfigurationRowFormikValues;
    if (formik.values[keyType] !== formik.initialValues[keyType]) {
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

  initNames.forEach((init, initIndex) => {
    const valueIndex = names.indexOf(init);
    if (valueIndex === -1) {
      removeCount++;
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
      addCount++;
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
