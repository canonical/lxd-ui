import React, { FC, ReactNode, useEffect, useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  useNotify,
  Notification,
} from "@canonical/react-components";
import { FormikProps } from "formik";
import StoragePoolFormMain from "./StoragePoolFormMain";
import StoragePoolFormMenu, {
  CEPH_CONFIGURATION,
  MAIN_CONFIGURATION,
  POWERFLEX,
  YAML_CONFIGURATION,
  ZFS_CONFIGURATION,
} from "./StoragePoolFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import { LxdStoragePool } from "types/storage";
import {
  btrfsDriver,
  cephDriver,
  powerFlex,
  zfsDriver,
} from "util/storageOptions";
import { getPoolKey } from "util/storagePool";
import { slugify } from "util/slugify";
import YamlForm from "components/forms/YamlForm";
import { dump as dumpYaml } from "js-yaml";
import { handleConfigKeys } from "util/storagePoolForm";
import YamlConfirmation from "components/forms/YamlConfirmation";
import { useDocs } from "context/useDocs";
import StoragePoolFormCeph from "./StoragePoolFormCeph";
import StoragePoolFormPowerflex from "./StoragePoolFormPowerflex";
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
  powerflex_clone_copy?: string;
  powerflex_domain?: string;
  powerflex_gateway?: string;
  powerflex_gateway_verify?: string;
  powerflex_mode?: string;
  powerflex_pool?: string;
  powerflex_sdt?: string;
  powerflex_user_name?: string;
  powerflex_user_password?: string;
  zfs_clone_copy?: string;
  zfs_export?: string;
  zfs_pool_name?: string;
  yaml?: string;
  barePool?: LxdStoragePool;
}

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
  section: string;
  setSection: (section: string) => void;
}

export const toStoragePool = (
  values: StoragePoolFormValues,
): LxdStoragePool => {
  const isCephDriver = values.driver === cephDriver;
  const isPowerFlexDriver = values.driver === powerFlex;
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
    }
    if (isPowerFlexDriver) {
      return {
        [getPoolKey("powerflex_clone_copy")]: values.powerflex_clone_copy,
        [getPoolKey("powerflex_domain")]: values.powerflex_domain,
        [getPoolKey("powerflex_gateway")]: values.powerflex_gateway,
        [getPoolKey("powerflex_gateway_verify")]:
          values.powerflex_gateway_verify,
        [getPoolKey("powerflex_mode")]: values.powerflex_mode,
        [getPoolKey("powerflex_pool")]: values.powerflex_pool,
        [getPoolKey("powerflex_sdt")]: values.powerflex_sdt,
        [getPoolKey("powerflex_user_name")]: values.powerflex_user_name,
        [getPoolKey("powerflex_user_password")]: values.powerflex_user_password,
      };
    }
    if (isZFSDriver) {
      return {
        [getPoolKey("zfs_clone_copy")]: values.zfs_clone_copy ?? "",
        [getPoolKey("zfs_export")]: values.zfs_export ?? "",
        [getPoolKey("zfs_pool_name")]: values.zfs_pool_name,
        size: hasValidSize ? values.size : undefined,
      };
    }
    return {
      size: hasValidSize ? values.size : undefined,
    };
  };

  const excludeMainKeys = new Set([
    "used_by",
    "etag",
    "status",
    "locations",
    "config",
    "name",
    "description",
    "driver",
    "source",
  ]);
  const missingMainFields = Object.fromEntries(
    Object.entries(values.barePool ?? {}).filter(
      (e) => !excludeMainKeys.has(e[0]),
    ),
  );

  const excludeConfigKeys = new Set(handleConfigKeys);
  const missingConfigFields = Object.fromEntries(
    Object.entries(values.barePool?.config ?? {}).filter(
      (e) => !excludeConfigKeys.has(e[0]),
    ),
  );

  return {
    ...missingMainFields,
    name: values.name,
    description: values.description,
    driver: values.driver,
    config: {
      ...missingConfigFields,
      ...getConfig(),
      source: values.driver !== btrfsDriver ? values.source : undefined,
    },
  };
};

const StoragePoolForm: FC<Props> = ({ formik, section, setSection }) => {
  const [confirmModal, setConfirmModal] = useState<ReactNode | null>(null);
  const docBaseLink = useDocs();
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const getYaml = () => dumpYaml(toStoragePool(formik.values));

  const handleSetActive = (val: string) => {
    if (Boolean(formik.values.yaml) && val !== YAML_CONFIGURATION) {
      const handleConfirm = () => {
        void formik.setFieldValue("yaml", undefined);
        setConfirmModal(null);
        setSection(val);
      };

      setConfirmModal(
        <YamlConfirmation
          onConfirm={handleConfirm}
          close={() => setConfirmModal(null)}
        />,
      );
    } else {
      setSection(val);
    }
  };

  return (
    <Form className="form storage-pool-form" onSubmit={formik.handleSubmit}>
      {confirmModal}
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <StoragePoolFormMenu
        active={section}
        setActive={handleSetActive}
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
          {section === slugify(POWERFLEX) && (
            <StoragePoolFormPowerflex formik={formik} />
          )}
          {section === slugify(ZFS_CONFIGURATION) && (
            <StoragePoolFormZFS formik={formik} />
          )}
          {section === slugify(YAML_CONFIGURATION) && (
            <YamlForm
              key={`yaml-form-${formik.values.readOnly}`}
              yaml={getYaml()}
              setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
              readOnly={formik.values.readOnly}
            >
              <Notification severity="information" title="YAML Configuration">
                This is the YAML representation of the storage pool.
                <br />
                <a
                  href={`${docBaseLink}/explanation/storage/#storage-pools`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about storage pools
                </a>
              </Notification>
            </YamlForm>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default StoragePoolForm;
