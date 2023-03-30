import React, { FC, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { LxdTerminalPayload } from "types/terminal";
import TerminalPayloadForm from "../TerminalPayloadForm";
import * as Yup from "yup";
import { useFormik } from "formik";

interface Props {
  onFinish: (data: LxdTerminalPayload) => void;
}

const ReconnectTerminalBtn: FC<Props> = ({ onFinish }) => {
  const [isModal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

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
        {
          key: "HOME",
          value: "/root",
        },
      ],
      user: 0,
      group: 0,
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
      closeModal();
    },
  });

  return (
    <>
      {isModal && <TerminalPayloadForm close={closeModal} formik={formik} />}
      <Button className="u-no-margin--bottom" hasIcon onClick={openModal}>
        <Icon name="connected" />
        <span>Reconnect</span>
      </Button>
    </>
  );
};

export default ReconnectTerminalBtn;
