import React, { FC, useEffect, useState } from "react";
import { Form, Input, Row, Col, useNotify } from "@canonical/react-components";
import { FormikProps } from "formik";
import StoragePoolFormMain from "./StoragePoolFormMain";
import StoragePoolFormMenu from "./StoragePoolFormMenu";
import { MAIN_CONFIGURATION } from "./StorageVolumeFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";

export interface StoragePoolFormValues {
  isCreating: boolean;
  readOnly: boolean;
  name: string;
  description: string;
  driver: string;
  source: string;
  size: string;
}

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolForm: FC<Props> = ({ formik }) => {
  const notify = useNotify();
  const [section, setSection] = useState(MAIN_CONFIGURATION);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  return (
    <Form className="form storage-pool-form" onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden />
      <StoragePoolFormMenu active={section} setActive={setSection} />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          {section === MAIN_CONFIGURATION && (
            <StoragePoolFormMain formik={formik} />
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default StoragePoolForm;
