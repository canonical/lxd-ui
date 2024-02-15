import { FC } from "react";
import { LxdStorageVolume } from "types/storage";
import SnapshotForm from "components/forms/SnapshotForm";
import { useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { createVolumeSnapshot } from "api/volume-snapshots";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { useState } from "react";
import { UNDEFINED_DATE, stringToIsoTime } from "util/helpers";
import { queryKeys } from "util/queryKeys";
import { SnapshotFormValues, getExpiresAt } from "util/snapshots";
import { getVolumeSnapshotSchema } from "util/storageVolumeSnapshots";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  close: () => void;
  volume: LxdStorageVolume;
}

const CreateVolumeSnapshotForm: FC<Props> = ({ close, volume }) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const formik = useFormik<SnapshotFormValues>({
    initialValues: {
      name: "",
      expirationDate: null,
      expirationTime: null,
    },
    validateOnMount: true,
    validationSchema: getVolumeSnapshotSchema(volume, controllerState),
    onSubmit: (values, { resetForm }) => {
      notify.clear();
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : UNDEFINED_DATE;
      void createVolumeSnapshot({
        volume,
        name: values.name,
        expiresAt,
      })
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey[0] === queryKeys.volumes ||
                  query.queryKey[0] === queryKeys.storage,
              });
              toastNotify.success(`Snapshot ${values.name} created.`);
              close();
              resetForm();
            },
            (msg) => {
              toastNotify.failure(
                `Snapshot ${values.name} creation failed`,
                new Error(msg),
              );
              formik.setSubmitting(false);
            },
          );
        })
        .catch((error: Error) => {
          notify.failure("Snapshot creation failed", error);
          formik.setSubmitting(false);
          close();
        });
    },
  });

  return <SnapshotForm isEdit={false} formik={formik} close={close} />;
};

export default CreateVolumeSnapshotForm;
