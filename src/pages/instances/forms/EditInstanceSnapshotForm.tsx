import { FC, ReactNode, useState } from "react";
import { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import SnapshotForm from "components/forms/SnapshotForm";
import { useQueryClient } from "@tanstack/react-query";
import {
  renameInstanceSnapshot,
  updateInstanceSnapshot,
} from "api/instance-snapshots";
import ItemName from "components/ItemName";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import {
  UNDEFINED_DATE,
  getBrowserFormatDate,
  stringToIsoTime,
} from "util/helpers";
import { getInstanceSnapshotSchema } from "util/instanceSnapshots";
import { queryKeys } from "util/queryKeys";
import { SnapshotFormValues, getExpiresAt } from "util/snapshots";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  close: () => void;
  onSuccess: (message: ReactNode) => void;
}

const EditInstanceSnapshotForm: FC<Props> = ({
  instance,
  snapshot,
  close,
  onSuccess,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const notifyUpdateSuccess = (name: string) => {
    void queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.instances,
    });
    onSuccess(
      <>
        Snapshot <ItemName item={{ name: name }} bold /> saved for instance{" "}
        {instance.name}.
      </>,
    );
    close();
  };

  const update = (expiresAt: string, newName?: string) => {
    const targetSnapshot = newName
      ? ({
          name: newName,
        } as LxdInstanceSnapshot)
      : snapshot;
    void updateInstanceSnapshot(instance, targetSnapshot, expiresAt)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => notifyUpdateSuccess(newName ?? snapshot.name),
          (msg) => {
            toastNotify.failure(
              `Snapshot update failed for instance ${instance.name}`,
              new Error(msg),
            );
            formik.setSubmitting(false);
          },
        ),
      )
      .catch((e) => {
        toastNotify.failure("Snapshot update failed", e);
        formik.setSubmitting(false);
      });
  };

  const rename = (newName: string, expiresAt?: string) => {
    void renameInstanceSnapshot(instance, snapshot, newName)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => {
            if (expiresAt) {
              update(expiresAt, newName);
            } else {
              notifyUpdateSuccess(newName);
            }
          },
          (msg) => {
            toastNotify.failure(
              `Snapshot rename failed for instance ${instance.name}`,
              new Error(msg),
            );
            formik.setSubmitting(false);
          },
        ),
      )
      .catch((e) => {
        toastNotify.failure("Snapshot rename failed", e);
        formik.setSubmitting(false);
      });
  };

  const [expiryDate, expiryTime] =
    snapshot.expires_at === UNDEFINED_DATE
      ? [null, null]
      : getBrowserFormatDate(new Date(snapshot.expires_at))
          .slice(0, 16)
          .split(" ");

  const formik = useFormik<SnapshotFormValues<{ stateful?: boolean }>>({
    initialValues: {
      name: snapshot.name,
      stateful: snapshot.stateful,
      expirationDate: expiryDate,
      expirationTime: expiryTime,
    },
    validateOnMount: true,
    validationSchema: getInstanceSnapshotSchema(
      instance,
      controllerState,
      snapshot.name,
    ),
    onSubmit: (values) => {
      const newName = values.name;
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : UNDEFINED_DATE;
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

export default EditInstanceSnapshotForm;
