import React, { FC, KeyboardEvent, useEffect, useRef } from "react";
import { Button, Form, Icon, Input, Modal } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { TerminalConnectPayload } from "types/terminal";
import * as Yup from "yup";
import { useFormik } from "formik";

interface Props {
  payload: TerminalConnectPayload;
  close: () => void;
  reconnect: (val: TerminalConnectPayload) => void;
}

const TerminalPayloadForm: FC<Props> = ({ payload, close, reconnect }) => {
  const ref = useRef<HTMLDivElement>(null);

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

  const formik = useFormik<TerminalConnectPayload>({
    initialValues: payload,
    validationSchema: TerminalSchema,
    onSubmit: reconnect,
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

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const updateContentHeight = () => {
    updateMaxHeight("content-wrapper", "p-modal__footer", 64, "max-height");
  };
  useEventListener("resize", updateContentHeight);
  useEffect(updateContentHeight, []);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "start",
    });
    window.dispatchEvent(new Event("resize"));
  }, [formik.values.environment]);

  return (
    <Modal
      close={close}
      title="Reconnect terminal"
      buttonRow={
        <>
          <Button
            className="u-no-margin--bottom"
            type="button"
            aria-label="cancel reconnect"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            className="u-no-margin--bottom"
            appearance="positive"
            aria-label="submit reconnect"
            onClick={formik.submitForm}
          >
            Reconnect
          </Button>
        </>
      }
      onKeyDown={handleEscKey}
    >
      <Form onSubmit={formik.handleSubmit}>
        <div className="content-wrapper">
          <Input
            id="command"
            name="command"
            label="Command"
            labelClassName="u-no-margin--bottom"
            type="text"
            required
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.command ? formik.errors.command : null}
            value={formik.values.command}
          />
          <Input
            id="user"
            name="user"
            label="User ID"
            labelClassName="u-no-margin--bottom"
            type="number"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.user}
          />
          <Input
            id="group"
            name="group"
            label="Group ID"
            labelClassName="u-no-margin--bottom"
            type="number"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.group}
          />
          {/* hidden submit to enable enter key in inputs */}
          <Input type="submit" hidden />
          <p className="u-no-margin--bottom p-form__label">
            Environment variables
          </p>
          {formik.values.environment.map((_variable, index) => (
            <div key={index} className="env-variables">
              <Input
                type="text"
                placeholder="Key"
                labelClassName="u-off-screen"
                label={`Key of variable ${index}`}
                id={`environment.${index}.key`}
                name={`environment.${index}.key`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.environment[index].key}
              />
              <Input
                type="text"
                placeholder="Value"
                labelClassName="u-off-screen"
                label={`Value of variable ${index}`}
                id={`environment.${index}.value`}
                name={`environment.${index}.value`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.environment[index].value}
              />
              <Button
                aria-label={`remove variable ${index}`}
                onClick={() => removeEnvironmentRow(index)}
                type="button"
                hasIcon
              >
                <Icon name="delete" />
              </Button>
            </div>
          ))}
          <div ref={ref}>
            <Button
              aria-label="add variable"
              onClick={addEnvironmentRow}
              type="button"
            >
              <span>Add variable</span>
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default TerminalPayloadForm;
