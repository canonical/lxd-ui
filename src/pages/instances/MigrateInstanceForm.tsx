import React, { FC, KeyboardEvent } from "react";
import { Button, Form, Modal, Select } from "@canonical/react-components";
import * as Yup from "yup";
import { useFormik } from "formik";
import { LxdClusterMember } from "types/cluster";

interface Props {
  close: () => void;
  migrate: (target: string) => void;
  instance: string;
  location: string;
  members: LxdClusterMember[];
}

const MigrateInstanceForm: FC<Props> = ({
  close,
  migrate,
  instance,
  location,
  members,
}) => {
  const memberNames = members.map((member) => member.server_name);

  const MigrateSchema = Yup.object().shape({
    target: Yup.string().min(1, "This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      target: memberNames.find((member) => member !== location) ?? "",
    },
    validationSchema: MigrateSchema,
    onSubmit: (values) => {
      migrate(values.target);
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
      className="migrate-instance-modal"
      title={`Migrate instance ${instance}`}
      buttonRow={
        <>
          <Button
            className="u-no-margin--bottom"
            type="button"
            aria-label="cancel migrate"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            className="u-no-margin--bottom"
            appearance="positive"
            onClick={formik.submitForm}
            disabled={!formik.isValid}
          >
            Migrate
          </Button>
        </>
      }
      onKeyDown={handleEscKey}
    >
      <Form onSubmit={formik.handleSubmit}>
        <Select
          id="locationMember"
          label="Move instance to cluster member"
          onChange={(e) => void formik.setFieldValue("target", e.target.value)}
          value={formik.values.target}
          options={memberNames.map((member) => {
            return {
              label: member,
              value: member,
              disabled: member === location,
            };
          })}
        />
      </Form>
    </Modal>
  );
};

export default MigrateInstanceForm;
