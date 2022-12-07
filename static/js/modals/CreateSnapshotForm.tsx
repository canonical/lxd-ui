import React, { FC, KeyboardEvent } from "react";
import { Button, Form, Input, Modal } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getTomorrowMidnight, stringToIsoTime } from "../util/helpers";
import { createSnapshot } from "../api/snapshots";
import { NotificationHelper } from "../types/notification";
import { queryKeys } from "../util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance } from "../types/instance";
import SubmitButton from "../buttons/SubmitButton";

interface Props {
  instance: LxdInstance;
  close: () => void;
  notify: NotificationHelper;
}

const CreateSnapshotForm: FC<Props> = ({ instance, close, notify }) => {
  const queryClient = useQueryClient();

  const isRunning = instance.status === "Running";
  const isStateful = instance.config["migration.stateful"];

  const getStatefulHelp = () => {
    if (isStateful && isRunning) {
      return "";
    }
    if (isStateful) {
      return <>To create a stateful snapshot, the instance must be running</>;
    }
    return (
      <>
        To create a stateful snapshot, the instance needs the{" "}
        <code>migration.stateful</code> config set to true
      </>
    );
  };
  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };

  const SnapshotSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
    stateful: Yup.boolean(),
  });

  const formik = useFormik<{
    name: string;
    stateful: boolean;
    expiresAt: string | null;
  }>({
    initialValues: {
      name: "",
      stateful: false,
      expiresAt: null,
    },
    validationSchema: SnapshotSchema,
    onSubmit: (values) => {
      const expiresAt = values.expiresAt
        ? stringToIsoTime(values.expiresAt)
        : null;
      createSnapshot(instance.name, values.name, expiresAt, values.stateful)
        .then(() => {
          void queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === queryKeys.instances,
          });
          notify.success(`Snapshot ${values.name} created.`);
          close();
        })
        .catch((e) => {
          notify.failure("Error on snapshot create.", e);
          close();
        });
    },
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Modal
        title={`Snapshots for ${instance.name}`}
        buttonRow={
          <>
            <Button
              className="u-no-margin--bottom"
              type="button"
              onClick={close}
            >
              Cancel
            </Button>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid}
              buttonLabel="Create snapshot"
            />
          </>
        }
        onKeyDown={handleEscKey}
      >
        <Input
          id="name"
          name="name"
          type="text"
          label="Snapshot name"
          required={true}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          error={formik.touched.name ? formik.errors.name : null}
          stacked
          takeFocus
        />
        <Input
          id="expiresAt"
          name="expiresAt"
          type="datetime-local"
          label="Expires at"
          min={getTomorrowMidnight()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          stacked
        />
        <Input
          id="stateful"
          name="stateful"
          type="checkbox"
          label="Stateful"
          wrapperClassName="row"
          help={getStatefulHelp()}
          disabled={!isStateful || !isRunning}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Modal>
    </Form>
  );
};

export default CreateSnapshotForm;
