import { FormDevice, FormDiskDevice } from "util/formDevices";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "components/forms/sharedFormTypes";
import { figureInheritedRootStorage } from "util/instanceConfigInheritance";
import { LxdProfile } from "types/profile";
import { LxdNicDevice } from "types/device";
import { FormikTouched } from "formik";

export const hasNoRootDisk = (
  values: SharedFormTypes & { profiles?: string[] },
  profiles: LxdProfile[],
) => {
  if (!values.profiles) {
    return false;
  }
  return (
    missingRoot(values.devices) && !inheritsRoot(values.profiles, profiles)
  );
};

const missingRoot = (devices: FormDevice[]) => {
  return !devices.some((item) => item.type === "disk" && item.name === "root");
};

const inheritsRoot = (selectedProfiles: string[], profiles: LxdProfile[]) => {
  const form = { profiles: selectedProfiles } as SharedFormTypes;
  const [inheritValue] = figureInheritedRootStorage(form, profiles);

  return !!inheritValue;
};

export const hasDiskError = (formik: SharedFormikTypes) =>
  !formik.values.yaml &&
  formik.values.devices.some((_device, index) =>
    isDiskDeviceMountPointMissing(formik, index),
  );

export const isDiskDeviceMountPointMissing = (
  formik: SharedFormikTypes,
  index: number,
): boolean => {
  const formDevice = formik.values.devices[index] as FormDiskDevice;
  if (formDevice.path === undefined || formDevice.type !== "disk") {
    return false;
  }
  const hasTouched =
    formik.touched.devices &&
    formik.touched.devices[index] &&
    (formik.touched.devices[index] as FormikTouched<FormDiskDevice>).path;

  return Boolean(hasTouched) && formDevice.path.length < 1;
};

export const hasNetworkError = (formik: SharedFormikTypes) =>
  !formik.values.yaml &&
  formik.values.devices.some((_device, index) =>
    isNicDeviceNameMissing(formik, index),
  );

export const isNicDeviceNameMissing = (
  formik: SharedFormikTypes,
  index: number,
): boolean => {
  const formDevice = formik.values.devices[index] as LxdNicDevice;
  if (formDevice.name || formDevice.type !== "nic") {
    return false;
  }

  const hasTouched =
    formik.touched.devices &&
    formik.touched.devices[index] &&
    (formik.touched.devices[index] as FormikTouched<LxdNicDevice>).name;

  return Boolean(hasTouched);
};
