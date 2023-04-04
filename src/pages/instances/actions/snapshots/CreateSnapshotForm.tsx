import React, { FC, KeyboardEvent, ReactNode, useState } from "react";
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
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName, getTomorrow, stringToIsoTime } from "util/helpers";
import { createSnapshot } from "api/snapshots";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { LxdInstance } from "types/instance";
import SubmitButton from "components/SubmitButton";
import { useNotify } from "context/notify";
import NotificationRow from "components/NotificationRow";
import ItemName from "components/ItemName";
import { TOOLTIP_OVER_MODAL_ZINDEX } from "util/zIndex";

interface Props {
  instance: LxdInstance;
  close: () => void;
  onSuccess: (message: ReactNode) => void;
}

const CreateSnapshotForm: FC<Props> = ({ instance, close, onSuccess }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const isRunning = instance.status === "Running";
  const isStateful = instance.config["migration.stateful"];

  const getStatefulInfo = () => {
    if (isStateful && isRunning) {
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

  const getExpiresAt = (
    expirationDate: string,
    expirationTime: string | null
  ) => {
    expirationTime = expirationTime ?? "00:00";
    return `${expirationDate}T${expirationTime}`;
  };

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

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

  const formik = useFormik<{
    name: string;
    stateful: boolean;
    expirationDate: string | null;
    expirationTime: string | null;
  }>({
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

  const submitForm = () => {
    void formik.submitForm();
  };

  return (
    <Modal
      className="snapshot-creation-modal"
      close={close}
      title="Create snapshot"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" type="button" onClick={close}>
            Cancel
          </Button>
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            isDisabled={!formik.isValid}
            buttonLabel="Create"
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
          error={formik.touched.name ? formik.errors.name : null}
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
            />
          </Col>
        </Row>
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
            />,
            <Tooltip
              key="stateful-info"
              position="btm-left"
              message={getStatefulInfo()}
              zIndex={TOOLTIP_OVER_MODAL_ZINDEX}
            >
              <Icon name="information" />
            </Tooltip>,
          ]}
        />
      </Form>
    </Modal>
  );
};

export default CreateSnapshotForm;
