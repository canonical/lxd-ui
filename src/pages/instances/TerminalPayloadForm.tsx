import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { useEffect, useRef } from "react";
import type { NotificationType } from "@canonical/react-components";
import {
  ActionButton,
  Button,
  failure,
  Form,
  Icon,
  Input,
  Modal,
  Notification,
  success,
  useListener,
} from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { TerminalConnectPayload } from "types/terminal";
import * as Yup from "yup";
import { useFormik } from "formik";
import type { LxdInstance } from "types/instance";
import { updateInstance } from "api/instances";
import { useEventQueue } from "context/eventQueue";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UI_TERMINAL_DEFAULT_PAYLOAD } from "pages/instances/InstanceTerminal";

interface Props {
  payload: TerminalConnectPayload;
  close: () => void;
  reconnect: (val: TerminalConnectPayload) => void;
  instance: LxdInstance;
}

const TerminalPayloadForm: FC<Props> = ({
  payload,
  close,
  reconnect,
  instance,
}) => {
  const eventQueue = useEventQueue();
  const [notification, setNotification] = useState<NotificationType | null>(
    null,
  );
  const queryClient = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);

  const TerminalSchema = Yup.object().shape({
    command: Yup.string().required("This field is required"),
    environment: Yup.array().of(
      Yup.object().shape({
        key: Yup.string(),
        value: Yup.string(),
      }),
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
    formik.setFieldValue("environment", copy);
  };

  const removeEnvironmentRow = (index: number) => {
    const copy = [...formik.values.environment];
    copy.splice(index, 1);
    formik.setFieldValue("environment", copy);
  };

  const handleSaveDefaults = () => {
    instance.config = {
      ...instance.config,
      [UI_TERMINAL_DEFAULT_PAYLOAD]: JSON.stringify(formik.values),
    };
    updateInstance(instance, instance.project)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            setNotification(
              success(
                "Saved terminal connection defaults for this instance.",
                "Saved successfully",
              ),
            );
          },
          (msg) => {
            setNotification(
              failure(
                "Failed to save terminal connection defaults.",
                new Error(msg),
              ),
            );
          },
          () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.instances, instance.name, instance.project],
            });
          },
        );
      })
      .catch((e) => {
        setNotification(
          failure("Failed to save terminal connection defaults.", e),
        );
      });
  };

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const updateContentHeight = () => {
    updateMaxHeight("content-wrapper", "p-modal__footer", 64, "max-height");
  };
  useListener(window, updateContentHeight, "resize", true);
  useEffect(updateContentHeight, []);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
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
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            aria-label="cancel reconnect"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            className="u-no-margin--bottom"
            type="button"
            title="Save as default for this instance"
            onClick={handleSaveDefaults}
          >
            Save as default
          </Button>
          <ActionButton
            className="u-no-margin--bottom"
            appearance="positive"
            aria-label="submit reconnect"
            onClick={() => void formik.submitForm()}
          >
            Reconnect
          </ActionButton>
        </>
      }
      onKeyDown={handleEscKey}
    >
      {notification && (
        <Notification
          severity={notification.type}
          title={notification.title}
          onDismiss={() => {
            setNotification(null);
          }}
          className="margin-right"
        >
          {notification.message}
        </Notification>
      )}
      <Form onSubmit={formik.handleSubmit}>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
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
                onClick={() => {
                  removeEnvironmentRow(index);
                }}
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
