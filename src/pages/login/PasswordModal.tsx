import type { FC } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
  Notification,
} from "@canonical/react-components";
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
      [Yup.ref("password"), ""],
      "Passwords must match",
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
      title="Create Certificate"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={handleSkip}>
            Generate without password
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => void formik.submitForm()}
            disabled={
              formik.values.password !== formik.values.passwordConfirm ||
              formik.values.password.length === 0
            }
          >
            Generate with password
          </ActionButton>
        </>
      }
    >
      <Notification severity="caution" className="u-no-margin--bottom">
        Passwords are required for client certificates on macOS. On other
        platforms, this step can be skipped.
      </Notification>
      <Input
        id="password"
        type="password"
        label="Password"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.password}
        error={formik.touched.password ? formik.errors.password : null}
      />
      <Input
        id="passwordConfirm"
        type="password"
        label="Confirm password"
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
