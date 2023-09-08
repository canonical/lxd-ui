import React, { FC, ReactNode, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  useNotify,
} from "@canonical/react-components";
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
} from "pages/storage/StorageVolumeFormMenu";
import { testDuplicateName } from "util/storageVolume";

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
}

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
  const getFormProps = (id: keyof StorageVolumeFormValues) => {
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
                <>
                  <Input
                    {...getFormProps("name")}
                    type="text"
                    label="Name"
                    required
                  />
                  <Input
                    {...getFormProps("size")}
                    type="number"
                    help="Size of the storage volume"
                    label="Size in GiB"
                  />
                  <Select
                    {...getFormProps("content_type")}
                    options={[
                      {
                        label: "filesystem",
                        value: "filesystem",
                      },
                      {
                        label: "block",
                        value: "block",
                      },
                    ]}
                    label="Content type"
                    help="Filesystem is ready to use, block can be formatted and only be used on VMs"
                    onChange={(e) => {
                      if (e.target.value === "block") {
                        void formik.setFieldValue(
                          "block_filesystem",
                          undefined
                        );
                        void formik.setFieldValue(
                          "block_mount_options",
                          undefined
                        );
                        void formik.setFieldValue(
                          "security_shifted",
                          undefined
                        );
                        void formik.setFieldValue(
                          "security_unmapped",
                          undefined
                        );
                      }
                      void formik.setFieldValue("content_type", e.target.value);
                    }}
                  />
                  {formik.values.content_type === "filesystem" && (
                    <>
                      <Input
                        {...getFormProps("security_shifted")}
                        type="checkbox"
                        label="Security shifted"
                        help="Enable id shifting overlay (allows attach by multiple isolated instances)"
                        stacked
                      />
                      <Input
                        {...getFormProps("security_unmapped")}
                        type="checkbox"
                        label="Security unmapped"
                        help="Disable id mapping for the volume"
                        stacked
                      />
                    </>
                  )}
                </>
              )}

              {section === SNAPSHOTS && (
                <>
                  <Input
                    {...getFormProps("snapshots_expiry")}
                    type="text"
                    label="Snapshots expiry"
                    help="Controls when snapshots are to be deleted (expects expression like 1M 2H 3d 4w 5m 6y)"
                  />
                  <Input
                    {...getFormProps("snapshots_pattern")}
                    type="text"
                    label="Snapshots pattern"
                    help="Pongo2 template string which represents the snapshot name (used for scheduled snapshots and unnamed snapshots)"
                  />
                  <Input
                    {...getFormProps("snapshots_schedule")}
                    type="text"
                    label="Snapshots schedule"
                    help="Cron expression (<minute> <hour> <dom> <month> <dow>), or a comma separated list of schedule aliases <@hourly> <@daily> <@midnight> <@weekly> <@monthly> <@annually> <@yearly>"
                  />
                </>
              )}

              {section === BLOCK && (
                <>
                  <Select
                    {...getFormProps("block_filesystem")}
                    options={[
                      {
                        label: "auto",
                        value: "",
                      },
                      {
                        label: "btrfs",
                        value: "btrfs",
                      },
                      {
                        label: "ext4",
                        value: "ext4",
                      },
                      {
                        label: "xfs",
                        value: "xfs",
                      },
                    ]}
                    label="Block filesystem"
                    help="Filesystem of the storage volume"
                  />
                  <Input
                    {...getFormProps("block_mount_options")}
                    type="text"
                    label="Block mount options"
                    help="Mount options for block devices"
                  />
                </>
              )}

              {section === LVM && (
                <>
                  <Input
                    {...getFormProps("lvm_stripes")}
                    type="number"
                    label="LVM stripes"
                    help="Number of stripes to use for new volumes (or thin pool volume)"
                  />
                  <Input
                    {...getFormProps("lvm_stripes_size")}
                    type="number"
                    label="LVM stripes size"
                    help="Size of stripes to use (at least 4096 bytes and multiple of 512bytes)"
                  />
                </>
              )}

              {section === ZFS && (
                <>
                  <Select
                    {...getFormProps("zfs_blocksize")}
                    label="ZFS blocksize"
                    help="Size of the ZFS blocks"
                    options={[
                      {
                        label: "default",
                        value: "",
                      },
                      {
                        label: "512",
                        value: "512",
                      },
                      {
                        label: "1024",
                        value: "1024",
                      },
                      {
                        label: "2048",
                        value: "2048",
                      },
                      {
                        label: "4096",
                        value: "4096",
                      },
                      {
                        label: "8192",
                        value: "8192",
                      },
                      {
                        label: "16384",
                        value: "16384",
                      },
                    ]}
                  />
                  <Input
                    {...getFormProps("zfs_block_mode")}
                    type="checkbox"
                    label="ZFS block mode"
                    help="Whether to use a formatted zvol rather than a dataset (zfs.block_mode can be set only for custom storage volumes; use volume.zfs.block_mode to enable ZFS block mode for all storage volumes in the pool, including instance volumes)"
                  />
                  <Input
                    {...getFormProps("zfs_delegate")}
                    type="checkbox"
                    label="ZFS delegate"
                    help="Controls whether to delegate the ZFS dataset and anything underneath it to the container(s) using it. Allows the use of the zfs command in the container."
                  />
                  <Input
                    {...getFormProps("zfs_remove_snapshots")}
                    type="checkbox"
                    label="ZFS remove snapshots"
                    help="Remove snapshots as needed"
                  />
                  <Input
                    {...getFormProps("zfs_use_refquota")}
                    type="checkbox"
                    label="ZFS use refquota"
                    help="Use refquota instead of quota for space"
                  />
                  <Input
                    {...getFormProps("zfs_reserve_space")}
                    type="checkbox"
                    label="ZFS reserve space"
                    help="Use reservation/refreservation along with quota/refquota"
                  />
                </>
              )}
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
