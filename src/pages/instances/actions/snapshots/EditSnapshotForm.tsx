import React, { FC, ReactNode, useState } from "react";
import { useFormik } from "formik";
import {
  checkDuplicateName,
  getBrowserFormatDate,
  stringToIsoTime,
} from "util/helpers";
import { renameSnapshot, updateSnapshot } from "api/snapshots";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";
import { CreateEditSnapshotFormValues, getExpiresAt } from "util/snapshotEdit";
import SnapshotForm from "./SnapshotForm";
import * as Yup from "yup";

interface Props {
  instance: LxdInstance;
  snapshot: LxdSnapshot;
  close: () => void;
  onSuccess: (message: ReactNode) => void;
}

const EditSnapshotForm: FC<Props> = ({
  instance,
  snapshot,
  close,
  onSuccess,
}) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const SnapshotSchema = Yup.object().shape({
    name: Yup.string()
      .required("This field is required")
      .test(
        "deduplicate",
        "Snapshot name already in use",
        (value) =>
          value === snapshot.name ||
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
    expirationDate: Yup.string().optional(),
    expirationTime: Yup.string().optional(),
    stateful: Yup.boolean(),
  });

  const notifyUpdateSuccess = (name: string) => {
    void queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.instances,
    });
    onSuccess(
      <>
        Snapshot <ItemName item={{ name: name }} bold /> saved.
      </>
    );
    close();
  };

  const update = (expiresAt?: string, newName?: string) => {
    // skip the update if it was not defined before and still is not defined
    if (snapshot.expires_at === "0001-01-01T00:00:00Z" && !expiresAt) return;
    if (!expiresAt) {
      // reset the expiry date to not defined
      expiresAt = "0001-01-01T00:00:00Z";
    }
    const targetSnapshot = newName
      ? ({
          name: newName,
        } as LxdSnapshot)
      : snapshot;
    updateSnapshot(instance, targetSnapshot, expiresAt)
      .then(() => {
        notifyUpdateSuccess(newName ?? snapshot.name);
      })
      .catch((e) => {
        notify.failure("Snapshot update failed", e);
        formik.setSubmitting(false);
      });
  };

  const rename = (newName: string, expiresAt?: string) => {
    renameSnapshot(instance, snapshot, newName)
      .then(() => {
        if (expiresAt) {
          update(expiresAt, newName);
        } else {
          notifyUpdateSuccess(newName);
        }
      })
      .catch((e) => {
        notify.failure("Snapshot rename failed", e);
        formik.setSubmitting(false);
      });
  };

  const [expiryDate, expiryTime] = snapshot.expires_at.startsWith(
    "0001-01-01T00"
  )
    ? [null, null]
    : getBrowserFormatDate(new Date(snapshot.expires_at))
        .slice(0, 16)
        .split(" ");

  const formik = useFormik<CreateEditSnapshotFormValues>({
    initialValues: {
      name: snapshot.name,
      stateful: snapshot.stateful,
      expirationDate: expiryDate,
      expirationTime: expiryTime,
    },
    validateOnMount: true,
    validationSchema: SnapshotSchema,
    onSubmit: (values) => {
      notify.clear();
      const newName = values.name;
      const expiresAt = values.expirationDate
        ? stringToIsoTime(
            getExpiresAt(values.expirationDate, values.expirationTime)
          )
        : undefined;
      const shouldRename = newName !== snapshot.name;
      const shouldUpdate = expiresAt !== snapshot.expires_at;
      if (shouldRename && shouldUpdate) {
        rename(newName, expiresAt);
      } else if (shouldRename) {
        rename(newName);
      } else if (shouldUpdate) {
        update(expiresAt);
      } else {
        close();
      }
    },
  });

  return (
    <SnapshotForm
      isEdit
      formik={formik}
      close={close}
      isStateful={!!instance.config["migration.stateful"]}
    />
  );
};

export default EditSnapshotForm;
