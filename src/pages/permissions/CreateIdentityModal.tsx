import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
  Icon,
  Input,
  Modal,
  Notification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { createFineGrainedTlsIdentity } from "api/auth-identities";
import { base64EncodeObject } from "util/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

interface Props {
  onClose: () => void;
}

const CreateIdentityModal: FC<Props> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      identityName: "",
    },
    onSubmit: (values) => {
      setError(false);
      createFineGrainedTlsIdentity(values.identityName)
        .then((response) => {
          const encodedToken = base64EncodeObject(response);
          setToken(encodedToken);

          queryClient.invalidateQueries({
            queryKey: [queryKeys.identities],
          });
        })
        .catch(() => {
          setError(true);
        });
    },
  });

  const handleCopy = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Modal
      close={onClose}
      className="create-tls-identity"
      title={token ? "Identity has been created" : "Generate trust token"}
      buttonRow={
        <>
          {token && (
            <>
              <Button
                aria-label={
                  copied ? "Copied to clipboard" : "Copy to clipboard"
                }
                title="Copy token"
                className="u-no-margin--bottom"
                onClick={() => handleCopy()}
                type="button"
                hasIcon
              >
                <Icon name={copied ? "task-outstanding" : "copy"} />
              </Button>

              <Button
                aria-label="Close"
                className="u-no-margin--bottom"
                onClick={onClose}
                type="button"
              >
                Close
              </Button>
            </>
          )}
          {!token && (
            <ActionButton
              aria-label="Generate token"
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={() => void formik.submitForm()}
              disabled={
                formik.values.identityName.length === 0 || formik.isSubmitting
              }
              loading={formik.isSubmitting}
            >
              Generate token
            </ActionButton>
          )}
        </>
      }
    >
      {error && (
        <Notification
          severity="negative"
          title="Token creation failed"
        ></Notification>
      )}
      {!token && (
        <Input
          id="identityName"
          type="text"
          label="Identity Name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.identityName}
        />
      )}
      {token && (
        <>
          <p>The token below can be used to log in as the new identity.</p>

          <Notification
            severity="caution"
            title="Make sure to copy the token now as it will not be shown again."
          ></Notification>

          <div className="token-code-block">
            <code>{token}</code>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CreateIdentityModal;
