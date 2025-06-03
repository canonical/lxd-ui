import type { FC } from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import ItemName from "components/ItemName";
import { deleteIdentity } from "api/auth-identities";
import IdentityResource from "components/IdentityResource";
import { useIdentityEntitlements } from "util/entitlements/identities";
import LoggedInUserNotification from "pages/permissions/panels/LoggedInUserNotification";
import { useSettings } from "context/useSettings";
import { logout } from "util/helpers";

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
  const loggedInIdentityID = settings?.auth_user_name ?? "";
  const isSelf = identity.id === loggedInIdentityID;

  const handleDelete = () => {
    setDeleting(true);
    deleteIdentity(identity)
      .then(() => {
        if (isSelf && settings?.auth_user_method === "oidc") {
          // special case for OIDC users, as they would be recreated via the api on the next request
          // force a logout to prevent re-creation
          logout();
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
            Identity <IdentityResource identity={identity} /> deleted.
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
          <IdentityResource identity={identity} />,
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
              This will permanently delete <ItemName item={identity} bold />.
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
