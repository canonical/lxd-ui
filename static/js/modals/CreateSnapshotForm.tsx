import React, { FC } from "react";
import { Button, Form, Input, Modal } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { stringToIsoTime } from "../util/helpers";
import { createSnapshot } from "../api/snapshots";

type Props = {
  instanceName: string;
  onCancel: () => void;
  onCreateSuccess: (snapshotName: string) => void;
  onCreateError: (e: any) => void;
};

const CreateSnapshotForm: FC<Props> = ({
  instanceName,
  onCancel,
  onCreateSuccess,
  onCreateError,
}) => {
  const SnapshotSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
    stateful: Yup.boolean(),
  });

  const formik = useFormik({
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
      createSnapshot(instanceName, values.name, expiresAt, values.stateful)
        .then(() => onCreateSuccess(values.name))
        .catch((e) => onCreateError(e));
    },
  });

  const submitButton = formik.isSubmitting ? (
    <Button
      appearance="positive"
      type="submit"
      hasIcon
      disabled
      style={{ marginRight: "1rem" }}
    >
      <i className="p-icon--spinner is-light u-animation--spin"></i>{" "}
      <span>Processing...</span>
    </Button>
  ) : (
    <Button
      appearance="positive"
      type="submit"
      disabled={!formik.dirty || !formik.isValid}
      style={{ marginRight: "1rem" }}
    >
      Create Snapshot
    </Button>
  );

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Modal
        close={onCancel}
        title={`Snapshots for ${instanceName}`}
        buttonRow={
          <>
            {submitButton}
            <Button className="u-no-margin--bottom" onClick={onCancel}>
              Cancel
            </Button>
          </>
        }
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
        />
        <Input
          id="expiresAt"
          name="expiresAt"
          type="datetime-local"
          label="Expires at"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          stacked
        />
        <Input
          id="stateful"
          name="stateful"
          type="checkbox"
          label="Stateful"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          stacked
        />
      </Modal>
    </Form>
  );
};

export default CreateSnapshotForm;
