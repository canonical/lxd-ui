import { useState, type FC } from "react";
import {
  ConfirmationModal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdIdentity } from "types/permissions";
import { issueBearerToken, revokeBearerToken } from "api/auth-identities";
import { queryKeys } from "util/queryKeys";
import IdentityResource from "components/IdentityResource";

export type IdentityTokenAction = "reissue" | "revoke";

interface Props {
  identity: LxdIdentity;
  action: IdentityTokenAction;
  close: () => void;
  onReissueSuccess: (token: string) => void;
}

const IdentityTokenConfirmModal: FC<Props> = ({
  identity,
  action,
  close,
  onReissueSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const invalidateIdentityQueries = () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.identities] });
  };

  const handleReissue = () => {
    setSubmitting(true);
    issueBearerToken(identity.name)
      .then((response) => {
        invalidateIdentityQueries();
        toastNotify.success(
          <>
            New token issued for{" "}
            <IdentityResource identity={identity} variant="label" />.
          </>,
        );
        onReissueSuccess(response.token);
        close();
      })
      .catch((e) => {
        notify.failure("Token issue failed", e);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleRevoke = () => {
    setSubmitting(true);
    revokeBearerToken(identity.name)
      .then(() => {
        invalidateIdentityQueries();
        toastNotify.success(
          <>
            Token revoked for{" "}
            <IdentityResource identity={identity} variant="label" />.
          </>,
        );
        close();
      })
      .catch((e) => {
        notify.failure("Token revoke failed", e);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const title = action === "reissue" ? "Issue new token" : "Revoke token";

  const confirmButtonLabel =
    action === "reissue" ? "Issue new token" : "Revoke token";

  const body =
    action === "reissue" ? (
      <p>
        This will invalidate the current token for{" "}
        <IdentityResource identity={identity} variant="label" /> and issue a new
        one. Existing integrations using the previous token will stop working
        until they are updated with the new token.
      </p>
    ) : (
      <p>
        This will revoke the current token for{" "}
        <IdentityResource identity={identity} variant="label" />. The identity
        holder will lose API access until a new token is issued.
      </p>
    );

  return (
    <ConfirmationModal
      title={title}
      confirmButtonLabel={confirmButtonLabel}
      confirmButtonAppearance={action === "reissue" ? "positive" : "negative"}
      onConfirm={action === "reissue" ? handleReissue : handleRevoke}
      close={close}
      confirmButtonLoading={submitting}
    >
      {body}
    </ConfirmationModal>
  );
};

export default IdentityTokenConfirmModal;
