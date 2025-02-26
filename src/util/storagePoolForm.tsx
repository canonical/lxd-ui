import type {
  LxdStoragePool,
  LXDStoragePoolOnClusterMember,
} from "types/storage";
import type { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import {
  zfsDriver,
  btrfsDriver,
  lvmDriver,
  dirDriver,
  cephDriver,
  cephFSDriver,
} from "util/storageOptions";

export const isStoragePoolWithSize = (driver: string) => {
  const driversWithSize = [zfsDriver, lvmDriver, btrfsDriver];
  return driversWithSize.includes(driver);
};

export const isStoragePoolWithSource = (driver: string) => {
  const driversWithSource = [
    dirDriver,
    btrfsDriver,
    lvmDriver,
    zfsDriver,
    cephDriver,
    cephFSDriver,
  ];
  return driversWithSource.includes(driver);
};

export const toStoragePoolFormValues = (
  pool: LxdStoragePool,
  poolOnMembers?: LXDStoragePoolOnClusterMember[],
  editRestriction?: string,
): StoragePoolFormValues => {
  const sourcePerClusterMember: ClusterSpecificValues = {};
  const zfsPoolNamePerClusterMember: ClusterSpecificValues = {};
  const sizePerClusterMember: ClusterSpecificValues = {};

  poolOnMembers?.forEach((item) => {
    if (isStoragePoolWithSize(item.driver)) {
      sizePerClusterMember[item.memberName] = item.config?.size ?? "";
    }
    sourcePerClusterMember[item.memberName] = item.config?.source ?? "";
    zfsPoolNamePerClusterMember[item.memberName] =
      item.config?.["zfs.pool_name"] ?? "";
  });

  return {
    barePool: pool,
    ceph_cluster_name: pool.config?.["ceph.cluster_name"],
    ceph_osd_pg_num: pool.config?.["ceph.osd.pg_num"],
    ceph_rbd_clone_copy: pool.config?.["ceph.rbd.clone_copy"],
    ceph_user_name: pool.config?.["ceph.user.name"],
    ceph_rbd_features: pool.config?.["ceph.rbd.features"],
    cephfs_cluster_name: pool.config?.["cephfs.cluster_name"],
    cephfs_create_missing: pool.config?.["cephfs.create_missing"],
    cephfs_fscache: pool.config?.["cephfs.fscache"],
    cephfs_osd_pg_num: pool.config?.["cephfs.osd_pg_num"],
    cephfs_path: pool.config?.["cephfs.path"],
    cephfs_user_name: pool.config?.["cephfs.user.name"],
    description: pool.description,
    driver: pool.driver,
    entityType: "storagePool",
    isCreating: false,
    name: pool.name,
    powerflex_clone_copy: pool.config?.["powerflex.clone_copy"],
    powerflex_domain: pool.config?.["powerflex.domain"],
    powerflex_gateway: pool.config?.["powerflex.gateway"],
    powerflex_gateway_verify: pool.config?.["powerflex.gateway.verify"],
    powerflex_mode: pool.config?.["powerflex.mode"],
    powerflex_pool: pool.config?.["powerflex.pool"],
    powerflex_sdt: pool.config?.["powerflex.sdt"],
    powerflex_user_name: pool.config?.["powerflex.user.name"],
    powerflex_user_password: pool.config?.["powerflex.user.password"],
    pure_api_token: pool.config?.["pure.api.token"],
    pure_gateway: pool.config?.["pure.gateway"],
    pure_gateway_verify: pool.config?.["pure.gateway.verify"],
    pure_mode: pool.config?.["pure.mode"],
    pure_target: pool.config?.["pure.target"],
    readOnly: true,
    size: pool.config?.size || "GiB",
    sizePerClusterMember,
    source: pool.config?.source || "",
    sourcePerClusterMember,
    zfs_clone_copy: pool.config?.["zfs.clone_copy"],
    zfs_export: pool.config?.["zfs.export"],
    zfs_pool_name: pool.config?.["zfs.pool_name"],
    zfsPoolNamePerClusterMember,
    editRestriction,
  };
};

export const handleConfigKeys = [
  "size",
  "source",
  "ceph.cluster_name",
  "ceph.osd.pg_num",
  "ceph.rbd.clone_copy",
  "ceph.user.name",
  "ceph.rbd.features",
  "zfs.clone_copy",
  "zfs.export",
  "zfs.pool_name",
];
