import React, { FC, ReactNode, useState } from "react";
import { useFormik } from "formik";
import {
  UNDEFINED_DATE,
  checkDuplicateName,
  getTomorrow,
  stringToIsoTime,
} from "util/helpers";
import { createSnapshot } from "api/snapshots";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance } from "types/instance";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";
import {
  SnapshotFormValues,
  getExpiresAt,
  testForbiddenChars,
} from "util/snapshots";
import SnapshotForm from "./SnapshotForm";
import * as Yup from "yup";

interface Props {
  instance: LxdInstance;
  close: () => void;
  onSuccess: (message: ReactNode) => void;
}

const CreateSnapshotForm: FC<Props> = ({ instance, close, onSuccess }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const SnapshotSchema: unknown = Yup.object().shape({
    name: Yup.string()
      .required("This field is required")
      .test("deduplicate", "Snapshot name already in use", (value) =>
        checkDuplicateName(
          value,
          instance.project,
          controllerState,
          `instances/${instance.name}/snapshots`
        )
      )
      .test(...testForbiddenChars()),
    expirationDate: Yup.string()
      .nullable()
      .optional()
      .test("valid", "Invalid date format", (value) => {
        if (!value) {
          return !formik.values.expirationTime;
        }
        return new Date(value).toString() !== "Invalid Date";
      })
      .test("future", "The date must be in the future", (value) => {
        if (!value) return true;
        const date = new Date(value).getTime();
        const tomorrow = new Date(getTomorrow()).getTime();
        return date >= tomorrow;
      }),
    expirationTime: Yup.string()
      .nullable()
      .optional()
      .test("valid", "Invalid time format", (value) => {
        if (!value) {
          return !formik.values.expirationDate;
        }
        const [hours, minutes] = value.split(":");
        const date = new Date();
        date.setHours(+hours);
        date.setMinutes(+minutes);
        return date.toString() !== "Invalid Date";
      }),
    stateful: Yup.boolean(),
  });

  const formik = useFormik<SnapshotFormValues>({
    initialValues: {
      name: "",
      stateful: false,
      expirationDate: null,
      expirationTime: null,
    },
    validateOnMount: true,
    validationSchema: SnapshotSchema,
    onSubmit: (values) => {
      notify.clear();
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime)
            )
          : UNDEFINED_DATE;
      createSnapshot(instance, values.name, expiresAt, values.stateful)
        .then(() => {
          void queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === queryKeys.instances,
          });
          onSuccess(
            <>
              Snapshot <ItemName item={values} bold /> created.
            </>
          );
          close();
        })
        .catch((e) => {
          notify.failure("Snapshot creation failed", e);
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <SnapshotForm
      isEdit={false}
      formik={formik}
      close={close}
      isStateful={!!instance.config["migration.stateful"]}
      isRunning={instance.status === "Running"}
    />
  );
};

export default CreateSnapshotForm;
