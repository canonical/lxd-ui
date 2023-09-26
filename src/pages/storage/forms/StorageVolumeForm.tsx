import React, { FC, ReactNode, useEffect, useState } from "react";
import { Col, Form, Row, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import { useParams } from "react-router-dom";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import StorageVolumeFormMenu, {
  FILESYSTEM,
  MAIN_CONFIGURATION,
  SNAPSHOTS,
  ZFS,
} from "pages/storage/forms/StorageVolumeFormMenu";
import StorageVolumeFormMain from "pages/storage/forms/StorageVolumeFormMain";
import StorageVolumeFormSnapshots from "pages/storage/forms/StorageVolumeFormSnapshots";
import StorageVolumeFormBlock from "pages/storage/forms/StorageVolumeFormBlock";
import StorageVolumeFormZFS from "pages/storage/forms/StorageVolumeFormZFS";
import { FormikProps } from "formik/dist/types";
import { getVolumeKey } from "util/storageVolume";
import { LxdStorageVolume } from "types/storage";

export interface StorageVolumeFormValues {
  name: string;
  project: string;
  pool: string;
  size?: string;
  content_type: "filesystem" | "block";
  type: string;
  security_shifted?: string;
  security_unmapped?: string;
  snapshots_expiry?: string;
  snapshots_pattern?: string;
  snapshots_schedule?: string;
  block_filesystem?: string;
  block_mount_options?: string;
  zfs_blocksize?: string;
  zfs_block_mode?: string;
  zfs_delegate?: string;
  zfs_remove_snapshots?: string;
  zfs_use_refquota?: string;
  zfs_reserve_space?: string;
  isReadOnly: boolean;
  isCreating: boolean;
}

export const volumeFormToPayload = (
  values: StorageVolumeFormValues,
  project: string
): LxdStorageVolume => {
  const hasValidSize = values.size?.match(/^\d/);
  return {
    name: values.name,
    config: {
      size: hasValidSize ? values.size : undefined,
      [getVolumeKey("security_shifted")]: values.security_shifted,
      [getVolumeKey("security_unmapped")]: values.security_unmapped,
      [getVolumeKey("snapshots_expiry")]: values.snapshots_expiry,
      [getVolumeKey("snapshots_pattern")]: values.snapshots_pattern,
      [getVolumeKey("snapshots_schedule")]: values.snapshots_schedule,
      [getVolumeKey("block_filesystem")]: values.block_filesystem,
      [getVolumeKey("block_mount_options")]: values.block_mount_options,
      [getVolumeKey("zfs_blocksize")]: values.zfs_blocksize,
      [getVolumeKey("zfs_block_mode")]: values.zfs_block_mode,
      [getVolumeKey("zfs_delegate")]: values.zfs_delegate,
      [getVolumeKey("zfs_remove_snapshots")]: values.zfs_remove_snapshots,
      [getVolumeKey("zfs_use_refquota")]: values.zfs_use_refquota,
      [getVolumeKey("zfs_reserve_space")]: values.zfs_reserve_space,
    },
    project,
    type: values.type,
    content_type: values.content_type,
    description: "",
    location: "",
    created_at: "",
  };
};

export const getFormProps = (
  formik: FormikProps<StorageVolumeFormValues>,
  id: keyof StorageVolumeFormValues
) => {
  return {
    id,
    name: id,
    onBlur: formik.handleBlur,
    onChange: formik.handleChange,
    value: (formik.values[id] as string | undefined) ?? "",
    error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
    stacked: true,
  };
};

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeForm: FC<Props> = ({ formik }) => {
  const notify = useNotify();
  const [section, setSection] = useState(MAIN_CONFIGURATION);
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: storagePools = [], error } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project),
  });

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const updateFormHeight = () => {
    updateMaxHeight("form", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useEventListener("resize", updateFormHeight);

  const poolDriver =
    storagePools.find((item) => item.name === formik.values.pool)?.driver ?? "";

  return (
    <Form onSubmit={formik.handleSubmit} stacked className="form">
      <StorageVolumeFormMenu
        active={section}
        setActive={setSection}
        formik={formik}
        poolDriver={poolDriver}
        contentType={formik.values.content_type}
        isCreating={formik.values.isCreating}
      />
      <Row className="form-contents">
        <Col size={12}>
          {section === MAIN_CONFIGURATION && (
            <StorageVolumeFormMain formik={formik} />
          )}
          {section === SNAPSHOTS && (
            <StorageVolumeFormSnapshots formik={formik} />
          )}
          {section === FILESYSTEM && <StorageVolumeFormBlock formik={formik} />}
          {section === ZFS && <StorageVolumeFormZFS formik={formik} />}
        </Col>
      </Row>
    </Form>
  );
};

export default StorageVolumeForm;
