import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button, Col, Form, Row, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { createStorageVolume, fetchStoragePools } from "api/storage-pools";
import NotificationRow from "components/NotificationRow";
import { useNavigate, useParams } from "react-router-dom";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import StorageVolumeFormMenu, {
  BLOCK,
  LVM,
  MAIN_CONFIGURATION,
  SNAPSHOTS,
  ZFS,
} from "pages/storage/forms/StorageVolumeFormMenu";
import { testDuplicateName } from "util/storageVolume";
import StorageVolumeFormMain from "pages/storage/forms/StorageVolumeFormMain";
import StorageVolumeFormSnapshots from "pages/storage/forms/StorageVolumeFormSnapshots";
import StorageVolumeFormBlock from "pages/storage/forms/StorageVolumeFormBlock";
import StorageVolumeFormLVM from "pages/storage/forms/StorageVolumeFormLVM";
import StorageVolumeFormZFS from "pages/storage/forms/StorageVolumeFormZFS";
import { FormikProps } from "formik/dist/types";

export interface StorageVolumeFormValues {
  name: string;
  pool: string;
  size?: string;
  content_type: "filesystem" | "block";
  security_shifted?: boolean;
  security_unmapped?: boolean;
  snapshots_expiry?: string;
  snapshots_pattern?: string;
  snapshots_schedule?: string;
  block_filesystem?: string;
  block_mount_options?: string;
  lvm_stripes?: string;
  lvm_stripes_size?: string;
  zfs_blocksize?: string;
  zfs_block_mode?: boolean;
  zfs_delegate?: boolean;
  zfs_remove_snapshots?: boolean;
  zfs_use_refquota?: boolean;
  zfs_reserve_space?: boolean;
  isReadOnly: boolean;
}

export const getFormProps = (
  formik: FormikProps<StorageVolumeFormValues>,
  id: keyof StorageVolumeFormValues
) => {
  return {
    id: id,
    name: id,
    onBlur: formik.handleBlur,
    onChange: formik.handleChange,
    value: (formik.values[id] ?? "") as string,
    error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
    stacked: true,
  };
};

const StorageVolumeForm: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [section, setSection] = useState(MAIN_CONFIGURATION);
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const { project, pool } = useParams<{ project: string; pool: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  if (!pool) {
    return <>Missing storage pool name</>;
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

  const StorageSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateName(project, pool, controllerState))
      .required("This field is required"),
  });

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: {
      content_type: "filesystem",
      name: "",
      pool: pool,
      size: "",
      isReadOnly: false,
    },
    validationSchema: StorageSchema,
    onSubmit: (values) => {
      const volume = {
        name: values.name,
        config: {
          size: values.size ? `${values.size}GiB` : undefined,
          "security.shifted": values.security_shifted?.toString(),
          "security.unmapped": values.security_unmapped?.toString(),
          "snapshots.expiry": values.snapshots_expiry,
          "snapshots.pattern": values.snapshots_pattern,
          "snapshots.schedule": values.snapshots_schedule,
          "block.filesystem": values.block_filesystem,
          "block.mount_options": values.block_mount_options,
          "lvm.stripes": values.lvm_stripes?.toString(),
          "lvm.stripes_size": values.lvm_stripes_size?.toString(),
          "zfs.blocksize": values.zfs_blocksize,
          "zfs.block_mode": values.zfs_block_mode?.toString(),
          "zfs.delegate": values.zfs_delegate?.toString(),
          "zfs.remove_snapshots": values.zfs_remove_snapshots?.toString(),
          "zfs.use_refquota": values.zfs_use_refquota?.toString(),
          "zfs.reserve_space": values.zfs_reserve_space?.toString(),
        },
        project: project,
        type: "custom",
        content_type: values.content_type,
      };

      createStorageVolume(pool, project, volume)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          navigate(
            `/ui/project/${project}/storage/detail/${pool}/volumes`,
            notify.queue(
              notify.success(`Storage volume ${values.name} created.`)
            )
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Storage volume creation failed", e);
        });
    },
  });

  const submitForm = () => {
    void formik.submitForm();
  };

  const poolDriver =
    storagePools.find((item) => item.name === pool)?.driver ?? "";

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h1 className="p-panel__title">Create volume</h1>
        </div>
        <div className="p-panel__content storage-volume-form">
          <NotificationRow />
          <Form onSubmit={formik.handleSubmit} stacked className="form">
            <StorageVolumeFormMenu
              active={section}
              setActive={setSection}
              formik={formik}
              poolDriver={poolDriver}
              contentType={formik.values.content_type}
            />
            <div className="form-contents">
              {section === MAIN_CONFIGURATION && (
                <StorageVolumeFormMain formik={formik} />
              )}
              {section === SNAPSHOTS && (
                <StorageVolumeFormSnapshots formik={formik} />
              )}
              {section === BLOCK && <StorageVolumeFormBlock formik={formik} />}
              {section === LVM && <StorageVolumeFormLVM formik={formik} />}
              {section === ZFS && <StorageVolumeFormZFS formik={formik} />}
            </div>
          </Form>
          <div className="l-footer--sticky p-bottom-controls">
            <hr />
            <Row className="u-align--right">
              <Col size={12}>
                <Button
                  appearance="base"
                  onClick={() =>
                    navigate(
                      `/ui/project/${project}/storage/detail/${pool}/volumes`
                    )
                  }
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid}
                  onClick={submitForm}
                  buttonLabel="Create"
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StorageVolumeForm;
