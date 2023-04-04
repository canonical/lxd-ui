import React, { FC, KeyboardEvent } from "react";
import { Button, Modal } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { useFormik } from "formik";
import { updateInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { useQueryClient } from "@tanstack/react-query";
import { useNotify } from "context/notify";
import SnapshotsForm from "pages/instances/forms/SnapshotsForm";
import { useParams } from "react-router-dom";
import {
  getInstanceEditValues,
  getInstancePayload,
  InstanceEditSchema,
} from "util/instanceEdit";

interface Props {
  instance: LxdInstance;
  close: () => void;
}

const ConfigureSnapshotModal: FC<Props> = ({ instance, close }) => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();

  const formik = useFormik<EditInstanceFormValues>({
    initialValues: getInstanceEditValues(instance),
    validationSchema: InstanceEditSchema,
    onSubmit: (values) => {
      const instancePayload = getInstancePayload(
        instance,
        values
      ) as LxdInstance;

      updateInstance(instancePayload, project ?? "")
        .then(() => {
          notify.success("Configuration updated.");
          close();
        })
        .catch((e: Error) => {
          notify.failure("Configuration update failed", e);
        })
        .finally(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances],
          });
        });
    },
  });

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  return (
    <Modal
      close={close}
      className="edit-snapshot-config"
      title="Snapshot configuration"
      buttonRow={
        formik.values.readOnly ? (
          <div className="u-space-between u-flex-row-reverse">
            <Button
              className="u-no-margin--bottom u-no-margin--right"
              onClick={close}
            >
              Close
            </Button>
            <Button
              className="u-no-margin--bottom"
              type="button"
              onClick={() => formik.setFieldValue("readOnly", false)}
            >
              Edit configuration
            </Button>
          </div>
        ) : (
          <>
            <Button
              className="u-no-margin--bottom"
              type="button"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={() => void formik.submitForm()}
            >
              Save
            </Button>
          </>
        )
      }
      onKeyDown={handleEscKey}
    >
      <SnapshotsForm formik={formik} />
    </Modal>
  );
};

export default ConfigureSnapshotModal;
