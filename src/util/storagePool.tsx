import { AbortControllerState, checkDuplicateName } from "util/helpers";
import { AnyObject, TestFunction } from "yup";
import { ConfigRowMetadata } from "./configInheritance";

export const cephStoragePoolDefaults: Record<string, string> = {
  ceph_cluster_name: "ceph",
  ceph_osd_pg_num: "32",
  ceph_rbd_clone_copy: "true",
  ceph_user_name: "admin",
  ceph_rbd_features: "layering",
};

export const getCephStoragePoolDefault = (
  formField: string,
): ConfigRowMetadata => {
  if (formField in cephStoragePoolDefaults) {
    return { value: cephStoragePoolDefaults[formField], source: "LXD" };
  }
  return { value: "", source: "LXD" };
};

const cephStoragePoolFormFieldToPayloadName: Record<string, string> = {
  ceph_cluster_name: "ceph.cluster_name",
  ceph_osd_pg_num: "ceph.osd.pg_num",
  ceph_rbd_clone_copy: "ceph.rbd.clone_copy",
  ceph_user_name: "ceph.user.name",
  ceph_rbd_features: "ceph.rbd.features",
};

export const getCephConfigKey = (key: string): string => {
  if (key in cephStoragePoolFormFieldToPayloadName) {
    return cephStoragePoolFormFieldToPayloadName[key];
  }
  return key;
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
