import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import { LxdIdentity } from "types/permissions";
import ItemName from "components/ItemName";
import { deleteIdentity } from "api/auth-identities";
import IdentityResource from "components/IdentityResource";

interface Props {
  identity: LxdIdentity;
}

const DeleteIdentityBtn: FC<Props> = ({ identity }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isDeleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setDeleting(true);
    deleteIdentity(identity)
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
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
      onHoverText="Delete identity"
      appearance="base"
      aria-label="Delete identity"
      className="has-icon u-no-margin--bottom"
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete <ItemName item={identity} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      shiftClickEnabled
      showShiftClickHint
      loading={isDeleting}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteIdentityBtn;
