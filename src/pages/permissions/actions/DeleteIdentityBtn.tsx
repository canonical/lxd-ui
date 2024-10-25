import { FC } from "react";
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
import { deleteOIDCIdentity } from "api/auth-identities";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  identity: LxdIdentity;
}

const DeleteIdentityBtn: FC<Props> = ({ identity }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();

  const handleDelete = () => {
    deleteOIDCIdentity(identity)
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
            Identity <ResourceLabel type={"idp-group"} value={identity.name} />{" "}
            deleted.
          </>,
        );
        close();
      })
      .catch((e) => {
        notify.failure(
          `Identity deletion failed`,
          e,
          <ResourceLabel type={"idp-group"} value={identity.name} />,
        );
      });
  };

  return (
    <ConfirmationButton
      onHoverText={"Delete identity"}
      appearance="base"
      aria-label="Delete identity"
      className={"has-icon"}
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
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteIdentityBtn;
