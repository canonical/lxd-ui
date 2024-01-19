import React, { FC } from "react";
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

interface Props {
  volume: LxdStorageVolume;
  snapshot: LxdVolumeSnapshot;
  close: () => void;
}

const EditVolumeSnapshotForm: FC<Props> = ({ volume, snapshot, close }) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const notifyUpdateSuccess = (name: string) => {
    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.volumes ||
        query.queryKey[0] === queryKeys.storage,
    });
    notify.success(`Snapshot ${name} saved.`);
    formik.setSubmitting(false);
    close();
  };

  const update = (expiresAt: string | null, newName?: string) => {
    // NOTE: volume snapshot update api call is synchronous, so can't use events api
    void updateVolumeSnapshot({
      volume,
      snapshot: { ...snapshot, name: newName || snapshot.name },
      expiresAt,
    })
      .then(() => {
        notifyUpdateSuccess(newName || snapshot.name);
      })
      .catch((error: Error) => {
        notify.failure("Snapshot update failed", error);
        formik.setSubmitting(false);
      });
  };

  const rename = (newName: string, expiresAt?: string | null) => {
    void renameVolumeSnapshot({
      volume,
      snapshot,
      newName,
    }).then((operation) =>
      eventQueue.set(
        operation.metadata.id,
        () => {
          if (expiresAt) {
            update(expiresAt || null, newName);
          } else {
            notifyUpdateSuccess(newName);
          }
        },
        (msg) => {
          notify.failure("Snapshot rename failed", new Error(msg));
          formik.setSubmitting(false);
        },
      ),
    );
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
    onSubmit: (values) => {
      notify.clear();
      const newName = values.name;
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : null;
      const shouldRename = newName !== snapshot.name;
      const shouldUpdate = expiresAt !== snapshot.expires_at;
      if (shouldRename && shouldUpdate) {
        rename(newName, expiresAt);
      } else if (shouldRename) {
        rename(newName);
      } else {
        update(expiresAt);
      }
    },
  });

  return <SnapshotForm isEdit formik={formik} close={close} />;
};

export default EditVolumeSnapshotForm;
