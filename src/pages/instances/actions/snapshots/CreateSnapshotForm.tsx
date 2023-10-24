import React, { FC, ReactNode, useState } from "react";
import { useFormik } from "formik";
import { UNDEFINED_DATE, stringToIsoTime } from "util/helpers";
import { createSnapshot } from "api/snapshots";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance } from "types/instance";
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
  close: () => void;
  onSuccess: (message: ReactNode) => void;
}

const CreateSnapshotForm: FC<Props> = ({ instance, close, onSuccess }) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const formik = useFormik<SnapshotFormValues>({
    initialValues: {
      name: "",
      stateful: false,
      expirationDate: null,
      expirationTime: null,
    },
    validateOnMount: true,
    validationSchema: getSnapshotSchema(instance, controllerState),
    onSubmit: (values) => {
      notify.clear();
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : UNDEFINED_DATE;
      void createSnapshot(
        instance,
        values.name,
        expiresAt,
        values.stateful,
      ).then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === queryKeys.instances,
            });
            onSuccess(
              <>
                Snapshot <ItemName item={values} bold /> created.
              </>,
            );
            close();
          },
          (msg) => {
            notify.failure("Snapshot creation failed", new Error(msg));
            formik.setSubmitting(false);
          },
        ),
      );
    },
  });

  return (
    <SnapshotForm
      isEdit={false}
      formik={formik}
      close={close}
      isStateful={isInstanceStateful(instance)}
      isRunning={instance.status === "Running"}
    />
  );
};

export default CreateSnapshotForm;
