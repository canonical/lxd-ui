import { FC, ReactNode, useEffect } from "react";
import { Col, Form, Input, Row, useNotify } from "@canonical/react-components";
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
import {
  getFilesystemVolumeFormFields,
  getVolumeConfigKeys,
  getVolumeKey,
  getZfsVolumeFormFields,
} from "util/storageVolume";
import {
  LxdStorageVolume,
  LxdStorageVolumeContentType,
  LxdStorageVolumeType,
} from "types/storage";
import { slugify } from "util/slugify";
import { driversWithFilesystemSupport } from "util/storageOptions";
import { getUnhandledKeyValues } from "util/formFields";

export interface StorageVolumeFormValues {
  name: string;
  project: string;
  pool: string;
  size?: string;
  content_type: LxdStorageVolumeContentType;
  volumeType: LxdStorageVolumeType;
  security_shifted?: string;
  security_unmapped?: string;
  snapshots_expiry?: string;
  snapshots_pattern?: string;
  snapshots_schedule?: string;
  block_filesystem?: string;
  block_mount_options?: string;
  block_type?: string;
  zfs_blocksize?: string;
  zfs_block_mode?: string;
  zfs_delegate?: string;
  zfs_remove_snapshots?: string;
  zfs_use_refquota?: string;
  zfs_reserve_space?: string;
  readOnly: boolean;
  isCreating: boolean;
  entityType: "storageVolume";
}

export const volumeFormToPayload = (
  values: StorageVolumeFormValues,
  project: string,
  volume?: LxdStorageVolume,
): LxdStorageVolume => {
  const hasValidSize = values.size?.match(/^\d/);
  const unhandledVolumeConfigs = getUnhandledKeyValues(
    volume?.config || {},
    getVolumeConfigKeys(),
  );
  const payload = {
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
      [getVolumeKey("block_type")]: values.block_type,
      [getVolumeKey("zfs_blocksize")]: values.zfs_blocksize,
      [getVolumeKey("zfs_block_mode")]: values.zfs_block_mode,
      [getVolumeKey("zfs_delegate")]: values.zfs_delegate,
      [getVolumeKey("zfs_remove_snapshots")]: values.zfs_remove_snapshots,
      [getVolumeKey("zfs_use_refquota")]: values.zfs_use_refquota,
      [getVolumeKey("zfs_reserve_space")]: values.zfs_reserve_space,
      ...unhandledVolumeConfigs,
    },
    project,
    type: values.volumeType,
    content_type: values.content_type,
    description: "",
    location: "",
    created_at: "",
    pool: values.pool,
  };

  const allPayloadKeys = Object.keys(payload);
  const unhandledVolumeMainConfigs = getUnhandledKeyValues(
    volume || {},
    new Set(allPayloadKeys),
  );

  return {
    ...payload,
    ...unhandledVolumeMainConfigs,
  };
};

export const getFormProps = (
  formik: FormikProps<StorageVolumeFormValues>,
  id: keyof StorageVolumeFormValues,
) => {
  return {
    id,
    name: id,
    onBlur: formik.handleBlur,
    onChange: formik.handleChange,
    value: (formik.values[id] as string | undefined) ?? "",
    error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
    placeholder: `Enter ${id.replaceAll("_", " ")}`,
  };
};

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  section: string;
  setSection: (val: string) => void;
}

const StorageVolumeForm: FC<Props> = ({ formik, section, setSection }) => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: pools = [], error } = useQuery({
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
    pools.find((item) => item.name === formik.values.pool)?.driver ?? "";

  const invalidFields: (keyof StorageVolumeFormValues)[] = [];
  if (!driversWithFilesystemSupport.includes(poolDriver)) {
    invalidFields.push(...getFilesystemVolumeFormFields());
  }
  if (poolDriver !== "zfs") {
    invalidFields.push(...getZfsVolumeFormFields());
  }
  for (const field of invalidFields) {
    if (formik.values[field] !== undefined) {
      void formik.setFieldValue(field, undefined);
    }
  }

  return (
    <Form onSubmit={formik.handleSubmit} className="form">
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
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
          {section === slugify(MAIN_CONFIGURATION) && (
            <StorageVolumeFormMain formik={formik} project={project} />
          )}
          {section === slugify(SNAPSHOTS) && (
            <StorageVolumeFormSnapshots formik={formik} />
          )}
          {section === slugify(FILESYSTEM) && (
            <StorageVolumeFormBlock formik={formik} poolDriver={poolDriver} />
          )}
          {section === slugify(ZFS) && <StorageVolumeFormZFS formik={formik} />}
        </Col>
      </Row>
    </Form>
  );
};

export default StorageVolumeForm;
