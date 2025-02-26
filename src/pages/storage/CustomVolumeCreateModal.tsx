import type { FC } from "react";
import { useEffect, useState } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { volumeFormToPayload } from "pages/storage/forms/StorageVolumeForm";
import { useFormik } from "formik";
import { createStorageVolume } from "api/storage-pools";
import { queryKeys } from "util/queryKeys";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import StorageVolumeFormMain from "pages/storage/forms/StorageVolumeFormMain";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { testDuplicateStorageVolumeName } from "util/storageVolume";
import type { LxdStorageVolume } from "types/storage";
import { useSettings } from "context/useSettings";
import { useStoragePools } from "context/useStoragePools";

interface Props {
  project: string;
  instanceLocation?: string;
  onCancel: () => void;
  onFinish: (volume: LxdStorageVolume) => void;
}

const CustomVolumeCreateModal: FC<Props> = ({
  project,
  instanceLocation,
  onCancel,
  onFinish,
}) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const { data: settings } = useSettings();

  const { data: pools = [] } = useStoragePools();

  const StorageVolumeSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageVolumeName(project, "custom", controllerState),
      )
      .required("This field is required"),
  });

  const isLocalPool = (poolName: string) => {
    const pool = pools.find((pool) => pool.name === poolName);
    const driverDetails = settings?.environment?.storage_supported_drivers.find(
      (driver) => driver.Name === pool?.driver,
    );
    if (!driverDetails) {
      return false;
    }
    return !driverDetails.Remote;
  };

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: {
      content_type: "filesystem",
      name: "",
      project: project,
      pool: "",
      size: "GiB",
      volumeType: "custom",
      readOnly: false,
      isCreating: true,
      entityType: "storageVolume",
    },
    validationSchema: StorageVolumeSchema,
    onSubmit: (values) => {
      const volume = volumeFormToPayload(values, project);
      const target = isLocalPool(values.pool) ? instanceLocation : undefined;

      createStorageVolume(values.pool, project, volume, target)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.customVolumes, project],
          });
          notify.success(`Storage volume ${values.name} created.`);
          onFinish(volume);
        })
        .catch((e) => {
          notify.failure("Storage volume creation failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  const validPool =
    !isLocalPool(formik.values.pool) || instanceLocation !== "any";
  const poolError = validPool
    ? undefined
    : "Please select a remote storage pool, or set a cluster member for the instance";

  const updateFormHeight = () => {
    updateMaxHeight("volume-create-form", "p-modal__footer", 32, undefined, []);
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useEventListener("resize", updateFormHeight);

  return (
    <>
      <div className="volume-create-form">
        <StorageVolumeFormMain formik={formik} poolError={poolError} />
      </div>
      <footer className="p-modal__footer">
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          onClick={onCancel}
        >
          Back
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => void formik.submitForm()}
          disabled={!formik.isValid || !validPool}
          loading={formik.isSubmitting}
        >
          Create volume
        </ActionButton>
      </footer>
    </>
  );
};

export default CustomVolumeCreateModal;
