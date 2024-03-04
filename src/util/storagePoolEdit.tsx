import { LxdStoragePool } from "types/storage";
import { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";

export const getStoragePoolEditValues = (
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
    zfs_clone_copy: pool.config["zfs.clone_copy"],
    zfs_export: pool.config["zfs.export"],
    zfs_pool_name: pool.config["zfs.pool_name"],
  };
};
