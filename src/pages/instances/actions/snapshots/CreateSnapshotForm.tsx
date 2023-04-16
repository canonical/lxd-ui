import React, { FC, ReactNode, useState } from "react";
import { useFormik } from "formik";
import { checkDuplicateName, stringToIsoTime } from "util/helpers";
import { createSnapshot } from "api/snapshots";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance } from "types/instance";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";
import { CreateEditSnapshotFormValues, getExpiresAt } from "util/snapshotEdit";
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

  const SnapshotSchema = Yup.object().shape({
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
      .test(
        "forbiddenChars",
        `The snapshot name cannot contain spaces or "/" characters`,
        (value) => {
          if (!value) {
            return true;
          }
          return !(value.includes(" ") || value.includes("/"));
        }
      ),
    stateful: Yup.boolean(),
  });

  const formik = useFormik<CreateEditSnapshotFormValues>({
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
      const expiresAt = values.expirationDate
        ? stringToIsoTime(
            getExpiresAt(values.expirationDate, values.expirationTime)
          )
        : null;
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
