import type {
  LxdStoragePool,
  LXDStoragePoolOnClusterMember,
} from "types/storage";
import { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";
import { ClusterSpecificValues } from "components/ClusterSpecificSelect";

export const toStoragePoolFormValues = (
  pool: LxdStoragePool,
  poolOnMembers?: LXDStoragePoolOnClusterMember[],
): StoragePoolFormValues => {
  const sourcePerClusterMember: ClusterSpecificValues = {};
  poolOnMembers?.forEach(
    (item) =>
      (sourcePerClusterMember[item.memberName] = item.config?.source ?? ""),
  );

  return {
    readOnly: true,
    isCreating: false,
    name: pool.name,
    description: pool.description,
    driver: pool.driver,
    source: pool.config?.source || "",
    size: pool.config?.size || "GiB",
    entityType: "storagePool",
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
    zfs_clone_copy: pool.config?.["zfs.clone_copy"],
    zfs_export: pool.config?.["zfs.export"],
    zfs_pool_name: pool.config?.["zfs.pool_name"],
    sourcePerClusterMember,
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
