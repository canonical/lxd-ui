import { useState, type FC } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
  Notification,
  Switch,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onConfirm: (password: string) => void;
  onClose: () => void;
  isPasswordRequired?: boolean;
}

const PasswordModal: FC<Props> = ({
  onConfirm,
  onClose,
  isPasswordRequired,
}) => {
  const [passwordRequired, setPasswordRequired] = useState(isPasswordRequired);
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
          {passwordRequired ? (
            <ActionButton
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={() => void formik.submitForm()}
              disabled={
                formik.values.password !== formik.values.passwordConfirm ||
                formik.values.password.length === 0
              }
            >
              Generate and download
            </ActionButton>
          ) : (
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={handleSkip}
            >
              Generate and download
            </Button>
          )}
        </>
      }
    >
      <Notification severity="caution" className="u-no-margin--bottom">
        Passwords are required for client certificates on macOS. On other
        platforms, a password is optional.
      </Notification>

      <Switch
        label="Password protected"
        checked={passwordRequired}
        onChange={() => {
          setPasswordRequired(!passwordRequired);
        }}
      />
      {passwordRequired && (
        <>
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
              formik.touched.passwordConfirm
                ? formik.errors.passwordConfirm
                : null
            }
          />
        </>
      )}
    </Modal>
  );
};

export default PasswordModal;
