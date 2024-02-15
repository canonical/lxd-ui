import { FormDevice, FormDiskDevice } from "util/formDevices";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "components/forms/instanceAndProfileFormValues";
import { getInheritedRootStorage } from "util/configInheritance";
import { LxdProfile } from "types/profile";
import { LxdNicDevice } from "types/device";
import { FormikTouched } from "formik";

export const hasNoRootDisk = (
  values: InstanceAndProfileFormValues & { profiles?: string[] },
  profiles: LxdProfile[],
): boolean => {
  if (values.entityType !== "instance") {
    return false;
  }
  return missingRoot(values.devices) && !inheritsRoot(values, profiles);
};

const missingRoot = (devices: FormDevice[]): boolean => {
  return !devices.some((item) => item.type === "disk" && item.name === "root");
};

const inheritsRoot = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): boolean => {
  const [inheritValue] = getInheritedRootStorage(values, profiles);

  return !!inheritValue;
};

export const hasDiskError = (formik: InstanceAndProfileFormikProps): boolean =>
  !formik.values.yaml &&
  formik.values.devices.some((_device, index) =>
    isDiskDeviceMountPointMissing(formik, index),
  );

export const isDiskDeviceMountPointMissing = (
  formik: InstanceAndProfileFormikProps,
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

export const hasNetworkError = (
  formik: InstanceAndProfileFormikProps,
): boolean =>
  !formik.values.yaml &&
  formik.values.devices.some((_device, index) =>
    isNicDeviceNameMissing(formik, index),
  );

export const isNicDeviceNameMissing = (
  formik: InstanceAndProfileFormikProps,
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
