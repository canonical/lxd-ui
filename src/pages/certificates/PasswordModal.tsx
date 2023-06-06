import React, { FC } from "react";
import { Button, Input, Modal } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onConfirm: (password: string) => void;
  onClose: () => void;
}

const PasswordModal: FC<Props> = ({ onConfirm, onClose }) => {
  const PasswordSchema = Yup.object().shape({
    password: Yup.string(),
    passwordConfirm: Yup.string().oneOf(
      [Yup.ref("password"), null],
      "Passwords must match"
    ),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      passwordConfirm: "",
    },
    validationSchema: PasswordSchema,
    onSubmit: (values) => {
      onConfirm(values.password);
    },
  });

  const handleSkip = () => {
    onConfirm("");
  };

  return (
    <Modal
      close={onClose}
      title="Add a password"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => formik.submitForm()}
            disabled={
              formik.values.password !== formik.values.passwordConfirm ||
              formik.values.password.length === 0
            }
          >
            Generate certificate
          </Button>
        </>
      }
    >
      <p>Protect your certificate by adding a password.</p>
      <Input
        id="password"
        type="password"
        label="Password"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.password}
        error={formik.touched.password ? formik.errors.password : null}
        help="For macOS an empty password is not allowed. On other systems this step can be skipped."
      />
      <Input
        id="passwordConfirm"
        type="password"
        label="Password confirmation"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.passwordConfirm}
        error={
          formik.touched.passwordConfirm ? formik.errors.passwordConfirm : null
        }
      />
    </Modal>
  );
};

export default PasswordModal;
