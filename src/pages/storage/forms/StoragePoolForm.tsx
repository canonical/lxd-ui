import { FC, useEffect } from "react";
import { Form, Input, Row, Col, useNotify } from "@canonical/react-components";
import { FormikProps } from "formik";
import StoragePoolFormMain from "./StoragePoolFormMain";
import StoragePoolFormMenu, {
  CEPH_CONFIGURATION,
  MAIN_CONFIGURATION,
  ZFS_CONFIGURATION,
} from "./StoragePoolFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import { LxdStoragePool } from "types/storage";
import { btrfsDriver, cephDriver, zfsDriver } from "util/storageOptions";
import { getPoolKey } from "util/storagePool";
import StoragePoolFormCeph from "./StoragePoolFormCeph";
import { slugify } from "util/slugify";
import StoragePoolFormZFS from "./StoragePoolFormZFS";

export interface StoragePoolFormValues {
  isCreating: boolean;
  readOnly: boolean;
  name: string;
  description: string;
  driver: string;
  source: string;
  entityType: "storagePool";
  size?: string;
  ceph_cluster_name?: string;
  ceph_osd_pg_num?: string;
  ceph_rbd_clone_copy?: string;
  ceph_user_name?: string;
  ceph_rbd_features?: string;
  zfs_clone_copy?: string;
  zfs_export?: string;
  zfs_pool_name?: string;
}

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
  section: string;
  setSection: (section: string) => void;
}

export const storagePoolFormToPayload = (
  values: StoragePoolFormValues,
): LxdStoragePool => {
  const isCephDriver = values.driver === cephDriver;
  const isZFSDriver = values.driver === zfsDriver;
  const hasValidSize = values.size?.match(/^\d/);

  const getConfig = () => {
    if (isCephDriver) {
      return {
        [getPoolKey("ceph_cluster_name")]: values.ceph_cluster_name,
        [getPoolKey("ceph_osd_pg_num")]: values.ceph_osd_pg_num?.toString(),
        [getPoolKey("ceph_rbd_clone_copy")]: values.ceph_rbd_clone_copy,
        [getPoolKey("ceph_user_name")]: values.ceph_user_name,
        [getPoolKey("ceph_rbd_features")]: values.ceph_rbd_features,
        source: values.source,
      };
    } else if (isZFSDriver) {
      return {
        [getPoolKey("zfs_clone_copy")]: values.zfs_clone_copy ?? "",
        [getPoolKey("zfs_export")]: values.zfs_export ?? "",
        [getPoolKey("zfs_pool_name")]: values.zfs_pool_name,
        size: hasValidSize ? values.size : undefined,
      };
    } else {
      return {
        size: hasValidSize ? values.size : undefined,
      };
    }
  };

  return {
    name: values.name,
    description: values.description,
    driver: values.driver,
    source: values.driver !== btrfsDriver ? values.source : undefined,
    config: getConfig(),
  };
};

const StoragePoolForm: FC<Props> = ({ formik, section, setSection }) => {
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  return (
    <Form className="form storage-pool-form" onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <StoragePoolFormMenu
        active={section}
        setActive={setSection}
        formik={formik}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          {section === slugify(MAIN_CONFIGURATION) && (
            <StoragePoolFormMain formik={formik} />
          )}
          {section === slugify(CEPH_CONFIGURATION) && (
            <StoragePoolFormCeph formik={formik} />
          )}
          {section === slugify(ZFS_CONFIGURATION) && (
            <StoragePoolFormZFS formik={formik} />
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default StoragePoolForm;
