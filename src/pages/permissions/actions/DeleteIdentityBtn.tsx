import { useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import { deleteIdentity } from "api/auth-identities";
import LoggedInUserNotification from "pages/permissions/panels/LoggedInUserNotification";
import IdentityResource from "components/IdentityResource";
import { useSettings } from "context/useSettings";
import { useAuth } from "context/auth";
import { AUTH_METHOD } from "util/authentication";
import { useIdentityEntitlements } from "util/entitlements/identities";
import { logoutOidc } from "util/helpers";

interface Props {
  identity: LxdIdentity;
}

const DeleteIdentityBtn: FC<Props> = ({ identity }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isDeleting, setDeleting] = useState(false);
  const { canDeleteIdentity } = useIdentityEntitlements();
  const { data: settings } = useSettings();
  const { authMethod } = useAuth();
  const loggedInIdentityID = settings?.auth_user_name ?? "";
  const isSelf = identity.id === loggedInIdentityID;

  const handleDelete = () => {
    setDeleting(true);
    deleteIdentity(identity)
      .then(() => {
        if (isSelf && authMethod === AUTH_METHOD.OIDC) {
          // special case for OIDC users, as they would be recreated via the api on the next request
          // force a logout to prevent re-creation
          logoutOidc();
          return;
        }
        queryClient.invalidateQueries({
          predicate: (query) => {
            return [
              queryKeys.identities,
              queryKeys.authGroups,
              queryKeys.settings,
            ].includes(query.queryKey[0] as string);
          },
        });
        toastNotify.success(
          <>
            Identity <IdentityResource identity={identity} variant="label" />{" "}
            deleted.
          </>,
        );
        setDeleting(false);
        close();
      })
      .catch((e) => {
        setDeleting(false);
        notify.failure(
          `Identity deletion failed`,
          e,
          <IdentityResource identity={identity} variant="label" />,
        );
      });
  };

  return (
    <ConfirmationButton
      onHoverText={
        canDeleteIdentity(identity)
          ? "Delete identity"
          : "You do not have permission to delete this identity"
      }
      appearance="base"
      aria-label="Delete identity"
      className="has-icon u-no-margin--bottom is-dense"
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <>
            <LoggedInUserNotification isVisible={isSelf} />
            <p>
              This will permanently delete identity{" "}
              <IdentityResource identity={identity} variant="label" />
              .
              <br />
              This action cannot be undone, and can result in data loss.
            </p>
          </>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      shiftClickEnabled
      showShiftClickHint
      loading={isDeleting}
      disabled={!canDeleteIdentity(identity) || isDeleting}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteIdentityBtn;
