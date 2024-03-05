import { FC } from "react";
import { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import SnapshotForm from "components/forms/SnapshotForm";
import { useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import {
  renameVolumeSnapshot,
  updateVolumeSnapshot,
} from "api/volume-snapshots";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { useState } from "react";
import { getBrowserFormatDate, stringToIsoTime } from "util/helpers";
import { queryKeys } from "util/queryKeys";
import { SnapshotFormValues, getExpiresAt } from "util/snapshots";
import { getVolumeSnapshotSchema } from "util/storageVolumeSnapshots";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  volume: LxdStorageVolume;
  snapshot: LxdVolumeSnapshot;
  close: () => void;
}

const EditVolumeSnapshotForm: FC<Props> = ({ volume, snapshot, close }) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const notifyUpdateSuccess = (name: string) => {
    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.volumes ||
        query.queryKey[0] === queryKeys.storage,
    });
    toastNotify.success(`Snapshot ${name} saved.`);
    formik.setSubmitting(false);
    close();
  };

  const updateExpirationTime = async (expiresAt: string | null) => {
    await updateVolumeSnapshot({
      volume,
      snapshot,
      expiresAt,
    }).catch((error: Error) => {
      notify.failure("Snapshot update failed", error);
      formik.setSubmitting(false);
    });
  };

  const rename = (newName: string): Promise<void> => {
    return new Promise((resolve) => {
      void renameVolumeSnapshot({
        volume,
        snapshot,
        newName,
      })
        .then((operation) =>
          eventQueue.set(operation.metadata.id, resolve, (msg) => {
            toastNotify.failure(
              `Snapshot ${snapshot.name} rename failed`,
              new Error(msg),
            );
            formik.setSubmitting(false);
          }),
        )
        .catch((e) => {
          notify.failure("Snapshot rename failed", e);
          formik.setSubmitting(false);
        });
    });
  };

  const [expiryDate, expiryTime] = !snapshot.expires_at
    ? [null, null]
    : getBrowserFormatDate(new Date(snapshot.expires_at))
        .slice(0, 16)
        .split(" ");

  const formik = useFormik<SnapshotFormValues>({
    initialValues: {
      name: snapshot.name,
      expirationDate: expiryDate,
      expirationTime: expiryTime,
    },
    validateOnMount: true,
    validationSchema: getVolumeSnapshotSchema(
      volume,
      controllerState,
      snapshot.name,
    ),
    onSubmit: async (values) => {
      notify.clear();
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : null;
      if (expiresAt !== snapshot.expires_at) {
        await updateExpirationTime(expiresAt);
      }
      if (values.name !== snapshot.name) {
        await rename(values.name);
      }
      notifyUpdateSuccess(values.name);
    },
  });

  return <SnapshotForm isEdit formik={formik} close={close} />;
};

export default EditVolumeSnapshotForm;
