import { AbortControllerState, checkDuplicateName } from "util/helpers";
import { AnyObject, TestFunction } from "yup";
import { LxdConfigOptionsKeys } from "types/config";

export const storagePoolFormFieldToPayloadName: Record<string, string> = {
  ceph_cluster_name: "ceph.cluster_name",
  ceph_osd_pg_num: "ceph.osd.pg_num",
  ceph_rbd_clone_copy: "ceph.rbd.clone_copy",
  ceph_user_name: "ceph.user.name",
  ceph_rbd_features: "ceph.rbd.features",
};

export const getPoolKey = (formField: string): string => {
  if (!(formField in storagePoolFormFieldToPayloadName)) {
    throw new Error(
      `Could not find ${formField} in storagePoolFormFieldToPayloadName`,
    );
  }
  return storagePoolFormFieldToPayloadName[formField];
};

export const getCephPoolFormFields = () => {
  return Object.keys(storagePoolFormFieldToPayloadName).filter((item) =>
    item.startsWith("ceph_"),
  );
};

const storagePoolDriverToOptionKey: Record<string, LxdConfigOptionsKeys> = {
  dir: "storage-dir",
  btrfs: "storage-btrfs",
  lvm: "storage-lvm",
  zfs: "storage-zfs",
  ceph: "storage-ceph",
};

export const storagePoolFormDriverToOptionKey = (
  driver: string,
): LxdConfigOptionsKeys => {
  if (!(driver in storagePoolDriverToOptionKey)) {
    throw new Error(`Could not find ${driver} in storagePoolDriverToOptionKey`);
  }
  return storagePoolDriverToOptionKey[driver];
};

export const testDuplicateStoragePoolName = (
  project: string,
  controllerState: AbortControllerState,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A storage pool with this name already exists",
    (value?: string) => {
      return checkDuplicateName(
        value,
        project,
        controllerState,
        `storage-pools`,
      );
    },
  ];
};
