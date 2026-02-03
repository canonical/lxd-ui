import type { FC } from "react";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import SnapshotForm from "components/forms/SnapshotForm";
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
import type { SnapshotFormValues } from "types/forms/snapshot";
import { getExpiresAt } from "util/snapshots";
import { getVolumeSnapshotSchema } from "util/storageVolumeSnapshots";
import VolumeSnapshotLinkChip from "../VolumeSnapshotLinkChip";
import { useToastNotification } from "@canonical/react-components";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  volume: LxdStorageVolume;
  snapshot: LxdVolumeSnapshot;
  close: () => void;
}

const EditVolumeSnapshotForm: FC<Props> = ({ volume, snapshot, close }) => {
  const eventQueue = useEventQueue();
  const { hasStorageAndProfileOperations } = useSupportedFeatures();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const rename = async (newName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      renameVolumeSnapshot(volume, snapshot, newName)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              resolve();
            },
            (msg) => {
              reject(new Error(msg));
            },
          );
        })
        .catch((e: Error) => {
          reject(e);
        });
    });
  };

  const [expiryDate, expiryTime] = !snapshot.expires_at
    ? [null, null]
    : getBrowserFormatDate(new Date(snapshot.expires_at))
        .slice(0, 16)
        .split(" ");

  const continueUpdate = async (values: SnapshotFormValues) => {
    let shouldShowSuccess = true;

    if (values.name !== snapshot.name) {
      await rename(values.name).catch((error: Error) => {
        toastNotify.failure("Snapshot update failed", error);
        shouldShowSuccess = false;
      });
    }
    if (shouldShowSuccess) {
      toastNotify.success(
        <>
          Snapshot <VolumeSnapshotLinkChip name={values.name} volume={volume} />{" "}
          saved.
        </>,
      );
    }
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.volumes ||
        query.queryKey[0] === queryKeys.storage,
    });
    formik.setSubmitting(false);
    close();
  };

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
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : null;
      if (expiresAt !== snapshot.expires_at) {
        await updateVolumeSnapshot(volume, snapshot, expiresAt)
          .then((operation) => {
            if (hasStorageAndProfileOperations) {
              eventQueue.set(
                operation.metadata.id,
                () => {
                  continueUpdate(values);
                },
                (msg) => {
                  toastNotify.failure("Snapshot update failed", new Error(msg));
                },
              );
            } else {
              continueUpdate(values);
            }
          })
          .catch((error: Error) => {
            toastNotify.failure("Snapshot update failed", error);
          });
      }
    },
  });

  return <SnapshotForm isEdit formik={formik} close={close} />;
};

export default EditVolumeSnapshotForm;
