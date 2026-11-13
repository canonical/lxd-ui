import type { FC } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
} from "@canonical/react-components";
import { getTomorrow } from "util/helpers";
import type { SnapshotFormValues } from "types/forms/snapshot";
import type { FormikProps } from "formik/dist/types";

interface Props {
  isEdit: boolean;
  formik: FormikProps<
    SnapshotFormValues<{ stateful?: boolean; includeCustomVolumes?: boolean }>
  >;
  close: () => void;
  additionalFormInput?: React.JSX.Element;
  isLoading?: boolean;
}

const SnapshotForm: FC<Props> = (props) => {
  const { isEdit, formik, close, additionalFormInput, isLoading } = props;

  return (
    <Modal
      className="snapshot-creation-modal"
      close={close}
      title={`${isEdit ? "Edit" : "Create"} snapshot`}
      buttonRow={
        <>
          <Button appearance="base" type="button" onClick={close}>
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            loading={formik.isSubmitting}
            disabled={!formik.isValid || formik.isSubmitting || isLoading}
            onClick={() => void formik.submitForm()}
          >
            {isEdit ? "Save changes" : "Create snapshot"}
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit} className="snapshot-creation-form">
        <Input
          id="name"
          name="name"
          type="text"
          label="Snapshot name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          error={
            (formik.touched.name || isEdit) && formik.errors.name ? (
              <span className="name-error">{formik.errors.name}</span>
            ) : null
          }
          takeFocus
        />
        <Row className="expiration-wrapper">
          <Col size={6}>
            <Input
              id="expirationDate"
              name="expirationDate"
              type="date"
              label="Expiration date"
              min={getTomorrow()}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.expirationDate ?? ""}
              error={
                formik.touched.expirationDate
                  ? formik.errors.expirationDate
                  : null
              }
            />
          </Col>
          <Col size={6}>
            <Input
              id="expirationTime"
              name="expirationTime"
              type="time"
              label="Expiration time"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.expirationTime ?? ""}
              error={
                formik.touched.expirationTime
                  ? formik.errors.expirationTime
                  : null
              }
            />
          </Col>
        </Row>
        {additionalFormInput}
      </Form>
    </Modal>
  );
};

export default SnapshotForm;
