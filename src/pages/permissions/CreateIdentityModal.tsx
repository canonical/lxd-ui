import { FC, useState } from "react";
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
import { base64EncodeTokenDetails } from "util/helpers";
import { useToastNotification } from "context/toastNotificationProvider";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

interface Props {
  onClose: () => void;
}

const CreateIdentityModal: FC<Props> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      clientName: "",
    },
    onSubmit: (values) => {
      setIsLoading(true);

      createFineGrainedTlsIdentity(values.clientName)
        .then((tokenPreResponse) => {
          const tempToken = base64EncodeTokenDetails(tokenPreResponse);

          setIsLoading(false);
          setToken(tempToken);

          void queryClient.invalidateQueries({
            queryKey: [queryKeys.identities],
          });
        })
        .catch(() => {
          setIsLoading(false);
          setError(true);
        });
    },
  });

  return (
    <Modal
      close={onClose}
      className="create-tls-identity"
      title="Generate trust token"
      buttonRow={
        <>
          {token && (
            <Button
              className="u-no-margin--bottom"
              onClick={() => {
                navigator.clipboard.writeText(token);
              }}
              type="button"
              hasIcon
            >
              <Icon name="copy" />
            </Button>
          )}
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={token ? onClose : () => void formik.submitForm()}
            disabled={formik.values.clientName.length === 0 || isLoading}
            loading={isLoading}
          >
            {token ? `Close` : `Generate Token`}
          </ActionButton>
        </>
      }
    >
      {error && (
        <Notification
          severity="negative"
          title="Fine grained identity token creation failed"
        ></Notification>
      )}
      {!token && (
        <Input
          id="clientName"
          type="text"
          label="Client Name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.clientName}
        />
      )}
      {token && (
        <>
          <p>Identity has been created.</p>
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
