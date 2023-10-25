import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  Label,
  Row,
  useNotify,
} from "@canonical/react-components";
import {
  StorageVolumeFormValues,
  volumeFormToPayload,
} from "pages/storage/forms/StorageVolumeForm";
import { useFormik } from "formik";
import { createStorageVolume, fetchStoragePools } from "api/storage-pools";
import { queryKeys } from "util/queryKeys";
import * as Yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import StorageVolumeFormMain from "pages/storage/forms/StorageVolumeFormMain";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { testDuplicateStorageVolumeName } from "util/storageVolume";
import { LxdStorageVolume } from "types/storage";

interface Props {
  project: string;
  onCancel: () => void;
  onFinish: (volume: LxdStorageVolume) => void;
}

const CustomVolumeCreateModal: FC<Props> = ({
  project,
  onCancel,
  onFinish,
}) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [pool, setPool] = useState<string>("");

  const { data: pools = [], error } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project),
  });

  useEffect(() => {
    if (pools.length > 0 && pool === "") {
      setPool(pools[0].name);
    }
  }, [pools]);

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const StorageVolumeSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageVolumeName(project, "custom", controllerState),
      )
      .required("This field is required"),
  });

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: {
      content_type: "filesystem",
      name: "",
      project: project,
      pool: pool,
      size: "GiB",
      type: "custom",
      isReadOnly: false,
      isCreating: true,
    },
    validationSchema: StorageVolumeSchema,
    onSubmit: (values) => {
      const volume = volumeFormToPayload(values, project);
      createStorageVolume(pool, project, volume)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.customVolumes],
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

  const updateFormHeight = () => {
    updateMaxHeight("volume-create-form", "p-modal__footer", 32);
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useEventListener("resize", updateFormHeight);

  return (
    <>
      <div className="volume-create-form">
        <Row>
          <Col size={8}>
            <Label forId="storage-pool-selector">* Storage pool</Label>
            <StoragePoolSelector
              project={project}
              value={pool}
              setValue={(val) => setPool(val)}
            />
          </Col>
        </Row>
        <StorageVolumeFormMain formik={formik} project={project} />
      </div>
      <footer className="p-modal__footer">
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={formik.submitForm}
        >
          Create volume
        </Button>
      </footer>
    </>
  );
};

export default CustomVolumeCreateModal;
