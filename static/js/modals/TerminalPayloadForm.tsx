import React, { FC } from "react";
import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  Label,
  Modal,
  Row,
} from "@canonical/react-components";
import * as Yup from "yup";
import { useFormik } from "formik";
import { LxdTerminalPayload } from "../types/terminal";

interface Props {
  close: () => void;
  onFinish: (data: LxdTerminalPayload) => void;
}

const TerminalPayloadForm: FC<Props> = ({ close, onFinish }) => {
  const TerminalSchema = Yup.object().shape({
    command: Yup.string().required("This field is required"),
    environment: Yup.array().of(
      Yup.object().shape({
        key: Yup.string(),
        value: Yup.string(),
      })
    ),
    user: Yup.number(),
    group: Yup.number(),
  });

  const formik = useFormik({
    initialValues: {
      command: "bash",
      environment: [
        {
          key: "TERM",
          value: "xterm-256color",
        },
      ],
      user: 1000,
      group: 1000,
    },
    validationSchema: TerminalSchema,
    onSubmit: (values) => {
      const result = {
        command: [values.command],
        "record-output": true,
        "wait-for-websocket": true,
        environment: values.environment.reduce(
          (a, v) => ({ ...a, [v.key]: v.value }),
          {}
        ),
        interactive: true,
        group: values.group,
        user: values.user,
      };
      onFinish(result);
    },
  });

  const addEnvironmentRow = () => {
    const copy = [...formik.values.environment];
    copy.push({ key: "", value: "" });
    void formik.setFieldValue("environment", copy);
  };

  const removeEnvironmentRow = (index: number) => {
    const copy = [...formik.values.environment];
    copy.splice(index, 1);
    void formik.setFieldValue("environment", copy);
  };

  return (
    <Modal
      title="Reconnect terminal"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" type="button" onClick={close}>
            Cancel
          </Button>
          <Button appearance="positive" onClick={formik.submitForm}>
            Reconnect
          </Button>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Input
          id="command"
          name="command"
          label="Command"
          type="text"
          required
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.command ? formik.errors.command : null}
          value={formik.values.command}
          stacked
        />
        <Input
          id="user"
          name="user"
          label="User id"
          type="number"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.user}
          stacked
        />
        <Input
          id="group"
          name="group"
          label="Group id"
          type="number"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.group}
          stacked
        />
        {/* hidden submit to enable enter key in inputs */}
        <input type="submit" hidden />
        <Row>
          <Col size={4}>
            <Label>Environment variables</Label>
          </Col>
          <Col size={3}>Key</Col>
          <Col size={3}>Value</Col>
          <Col size={2} />
        </Row>
        {formik.values.environment.map((variable, index) => (
          <Row key={index}>
            <Col size={4} />
            <Col size={3}>
              <input
                className="p-form-validation__input"
                style={{ width: "10rem" }}
                type="text"
                name={`environment.${index}.key`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.environment[index].key}
              />
            </Col>
            <Col size={3}>
              <input
                className="p-form-validation__input"
                style={{ width: "10rem" }}
                type="text"
                name={`environment.${index}.value`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.environment[index].value}
              />
            </Col>
            <Col size={2}>
              <Button
                onClick={() => removeEnvironmentRow(index)}
                type="button"
                hasIcon
              >
                <Icon name="delete" />
              </Button>
            </Col>
          </Row>
        ))}
        <Row>
          <Col size={4} />
          <Col size={8}>
            <Button onClick={addEnvironmentRow} type="button" hasIcon>
              <Icon name="plus" />
              <span>Add variable</span>
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TerminalPayloadForm;
