import React, { FC, KeyboardEvent } from "react";
import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  List,
  Modal,
  Row,
  Tooltip,
} from "@canonical/react-components";
import { getTomorrow } from "util/helpers";
import SubmitButton from "components/SubmitButton";
import { TOOLTIP_OVER_MODAL_ZINDEX } from "util/zIndex";
import { SnapshotFormValues } from "util/snapshots";
import { FormikProps } from "formik/dist/types";
import NotificationRow from "components/NotificationRow";

interface Props {
  isEdit: boolean;
  formik: FormikProps<SnapshotFormValues>;
  close: () => void;
  isStateful: boolean;
  isRunning?: boolean;
}

const SnapshotForm: FC<Props> = ({
  isEdit,
  formik,
  close,
  isStateful,
  isRunning,
}) => {
  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const getStatefulInfo = () => {
    if (isEdit || (isStateful && isRunning)) {
      return "";
    }
    if (isStateful) {
      return `To create a stateful snapshot,\nthe instance must be running`;
    }
    return (
      <>
        {`To create a stateful snapshot, the instance needs\n`}
        the <code>migration.stateful</code> config set to true
      </>
    );
  };
  const statefulInfoMessage = getStatefulInfo();

  const submitForm = () => {
    void formik.submitForm();
  };

  return (
    <Modal
      className="snapshot-creation-modal"
      close={close}
      title={`${isEdit ? "Edit" : "Create"} snapshot`}
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" type="button" onClick={close}>
            Cancel
          </Button>
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            isDisabled={!formik.isValid}
            buttonLabel={isEdit ? "Save" : "Create"}
            onClick={submitForm}
          />
        </>
      }
      onKeyDown={handleEscKey}
    >
      <NotificationRow />
      <Form onSubmit={formik.handleSubmit}>
        <Input
          id="name"
          name="name"
          type="text"
          label="Snapshot name"
          required={true}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          error={formik.touched.name || isEdit ? formik.errors.name : null}
          takeFocus
        />
        <Row className="expiration-wrapper">
          <Col size={6}>
            <Input
              id="expirationDate"
              name="expirationDate"
              type="date"
              label="Expiry date"
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
              label="Expiry time"
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
        {!isEdit && (
          <List
            inline
            items={[
              <Input
                key="stateful"
                id="stateful"
                name="stateful"
                type="checkbox"
                label="Stateful"
                wrapperClassName="u-inline-block"
                disabled={!isStateful || !isRunning}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                defaultChecked={formik.values.stateful}
              />,
              ...(statefulInfoMessage
                ? [
                    <Tooltip
                      key="stateful-info"
                      position="btm-left"
                      message={statefulInfoMessage}
                      zIndex={TOOLTIP_OVER_MODAL_ZINDEX}
                    >
                      <Icon name="information" />
                    </Tooltip>,
                  ]
                : []),
            ]}
          />
        )}
      </Form>
    </Modal>
  );
};

export default SnapshotForm;
