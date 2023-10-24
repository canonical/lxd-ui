import React, { FC, ReactNode, useState } from "react";
import { useFormik } from "formik";
import {
  UNDEFINED_DATE,
  getBrowserFormatDate,
  stringToIsoTime,
} from "util/helpers";
import { renameSnapshot, updateSnapshot } from "api/snapshots";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance, LxdSnapshot } from "types/instance";
import ItemName from "components/ItemName";
import {
  SnapshotFormValues,
  getExpiresAt,
  getSnapshotSchema,
  isInstanceStateful,
} from "util/snapshots";
import SnapshotForm from "./SnapshotForm";
import { useNotify } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";

interface Props {
  instance: LxdInstance;
  snapshot: LxdSnapshot;
  close: () => void;
  onSuccess: (message: ReactNode) => void;
}

const EditSnapshot: FC<Props> = ({ instance, snapshot, close, onSuccess }) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const notifyUpdateSuccess = (name: string) => {
    void queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.instances,
    });
    onSuccess(
      <>
        Snapshot <ItemName item={{ name: name }} bold /> saved.
      </>,
    );
    close();
  };

  const update = (expiresAt: string, newName?: string) => {
    const targetSnapshot = newName
      ? ({
          name: newName,
        } as LxdSnapshot)
      : snapshot;
    void updateSnapshot(instance, targetSnapshot, expiresAt).then((operation) =>
      eventQueue.set(
        operation.metadata.id,
        () => notifyUpdateSuccess(newName ?? snapshot.name),
        (msg) => {
          notify.failure("Snapshot update failed", new Error(msg));
          formik.setSubmitting(false);
        },
      ),
    );
  };

  const rename = (newName: string, expiresAt?: string) => {
    void renameSnapshot(instance, snapshot, newName).then((operation) =>
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
          notify.failure("Snapshot rename failed", new Error(msg));
          formik.setSubmitting(false);
        },
      ),
    );
  };

  const [expiryDate, expiryTime] =
    snapshot.expires_at === UNDEFINED_DATE
      ? [null, null]
      : getBrowserFormatDate(new Date(snapshot.expires_at))
          .slice(0, 16)
          .split(" ");

  const formik = useFormik<SnapshotFormValues>({
    initialValues: {
      name: snapshot.name,
      stateful: snapshot.stateful,
      expirationDate: expiryDate,
      expirationTime: expiryTime,
    },
    validateOnMount: true,
    validationSchema: getSnapshotSchema(
      instance,
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

  return (
    <SnapshotForm
      isEdit
      formik={formik}
      close={close}
      isStateful={isInstanceStateful(instance)}
    />
  );
};

export default EditSnapshot;
