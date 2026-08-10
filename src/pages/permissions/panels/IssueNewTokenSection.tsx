import { useState, type FC } from "react";
import { ConfirmationModal, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import IdentityTokenModal from "pages/permissions/IdentityTokenModal";
import type { LxdIdentity } from "types/permissions";
import IdentityResource from "components/IdentityResource";
import TokenExpirySelector from "pages/permissions/panels/TokenExpirySelector";
import {
  BEARER_EXPIRY_PATTERN,
  BEARER_EXPIRY_VALIDATION_TEXT,
  IDENTITY_MODAL_TEXT,
  getIdentityName,
  type IdentityType,
} from "util/permissionIdentities";
import { issueBearerToken } from "api/auth-identities";
import { queryKeys } from "util/queryKeys";
import type { IdentityFormValues } from "types/forms/identity";
import IssueNewTokenButton from "./IssueNewTokenButton";

interface Props {
  identity: LxdIdentity;
  canEdit: boolean;
}

const IssueNewTokenSection: FC<Props> = ({ identity, canEdit }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isCustomExpiry, setIsCustomExpiry] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [expiryError, setExpiryError] = useState<string | undefined>();
  const [confirmingReissue, setConfirmingReissue] = useState(false);
  const [reissuingToken, setReissuingToken] = useState(false);
  const [reissuedToken, setReissuedToken] = useState("");

  const identityFormValues: IdentityFormValues = {
    name: getIdentityName(identity),
    groups: identity.groups ?? [],
    identityType: identity.type as IdentityType,
    expiry: identity.expires_at || "",
  };
  const identityModalCaptions =
    IDENTITY_MODAL_TEXT[identityFormValues.identityType];

  const trimmedExpiry = expiry.trim();
  const isCustomExpiryValid =
    !isCustomExpiry ||
    (!!trimmedExpiry && BEARER_EXPIRY_PATTERN.test(trimmedExpiry));

  const handleIsCustomExpiryChange = (isCustom: boolean) => {
    setIsCustomExpiry(isCustom);
    if (!isCustom) {
      setExpiry("");
    }
    setExpiryError(undefined);
  };

  const handleExpiryBlur = () => {
    if (isCustomExpiry && !isCustomExpiryValid) {
      setExpiryError(BEARER_EXPIRY_VALIDATION_TEXT);
    } else {
      setExpiryError(undefined);
    }
  };

  const closeReissueConfirmModal = () => {
    setConfirmingReissue(false);
    setIsCustomExpiry(false);
    setExpiry("");
    setExpiryError(undefined);
  };

  const handleConfirmReissue = () => {
    if (!isCustomExpiryValid) {
      setExpiryError(BEARER_EXPIRY_VALIDATION_TEXT);
      return;
    }

    setReissuingToken(true);
    issueBearerToken(
      getIdentityName(identity),
      isCustomExpiry ? trimmedExpiry : "",
    )
      .then((response) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.identities] });
        setConfirmingReissue(false);
        setReissuedToken(response.token);
        setIsCustomExpiry(false);
        setExpiry("");
        setExpiryError(undefined);
      })
      .catch((e) => {
        notify.failure("Token issue failed", e);
      })
      .finally(() => {
        setReissuingToken(false);
      });
  };

  const closeTokenDisplayModal = () => {
    setReissuedToken("");
  };

  return (
    <>
      <IssueNewTokenButton
        canEdit={canEdit}
        onClick={() => {
          setConfirmingReissue(true);
        }}
      />

      {confirmingReissue && (
        <ConfirmationModal
          title="Issue new token"
          confirmButtonLabel="Issue new token"
          confirmButtonAppearance="positive"
          onConfirm={handleConfirmReissue}
          close={closeReissueConfirmModal}
          confirmButtonLoading={reissuingToken}
          className="permission-confirm-modal"
          confirmButtonDisabled={isCustomExpiry && !expiry}
          confirmButtonProps={{
            title:
              isCustomExpiry && !expiry
                ? "Please provide a valid expiry date"
                : undefined,
          }}
        >
          <p>
            This will invalidate the current token for{" "}
            <IdentityResource identity={identity} variant="label" /> and issue a
            new one. Existing integrations using the previous token will stop
            working until they are updated with the new token.
          </p>
          <TokenExpirySelector
            isCustomExpiry={isCustomExpiry}
            expiry={expiry}
            error={expiryError}
            onIsCustomExpiryChange={handleIsCustomExpiryChange}
            onExpiryChange={(value) => {
              setExpiry(value);
              if (expiryError) {
                setExpiryError(undefined);
              }
            }}
            onExpiryBlur={handleExpiryBlur}
          />
        </ConfirmationModal>
      )}

      {reissuedToken && identityModalCaptions && (
        <IdentityTokenModal
          onClose={closeTokenDisplayModal}
          token={reissuedToken}
          identity={identityFormValues}
          title={identityModalCaptions.codeSnippetTitle}
          notification={identityModalCaptions.notification}
          howToUseCli={identityModalCaptions.howToUseCli?.(reissuedToken)}
          howToUseUi={identityModalCaptions.howToUseUi}
          titleSuffix="token issued successfully"
        />
      )}
    </>
  );
};

export default IssueNewTokenSection;
