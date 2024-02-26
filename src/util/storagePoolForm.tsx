import { LxdStoragePool } from "types/storage";
import { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";

export const toStoragePoolFormValues = (
  pool: LxdStoragePool,
): StoragePoolFormValues => {
  return {
    readOnly: true,
    isCreating: false,
    name: pool.name,
    description: pool.description,
    driver: pool.driver,
    source: pool.config.source || "",
    size: pool.config.size || "GiB",
    entityType: "storagePool",
    ceph_cluster_name: pool.config["ceph.cluster_name"],
    ceph_osd_pg_num: pool.config["ceph.osd.pg_num"],
    ceph_rbd_clone_copy: pool.config["ceph.rbd.clone_copy"],
    ceph_user_name: pool.config["ceph.user.name"],
    ceph_rbd_features: pool.config["ceph.rbd.features"],
    powerflex_clone_copy: pool.config["powerflex.clone_copy"],
    powerflex_domain: pool.config["powerflex.domain"],
    powerflex_gateway: pool.config["powerflex.gateway"],
    powerflex_gateway_verify: pool.config["powerflex.gateway.verify"],
    powerflex_mode: pool.config["powerflex.mode"],
    powerflex_pool: pool.config["powerflex.pool"],
    powerflex_sdt: pool.config["powerflex.sdt"],
    powerflex_user_name: pool.config["powerflex.user.name"],
    powerflex_user_password: pool.config["powerflex.user.password"],
    zfs_clone_copy: pool.config["zfs.clone_copy"],
    zfs_export: pool.config["zfs.export"],
    zfs_pool_name: pool.config["zfs.pool_name"],
    barePool: pool,
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
