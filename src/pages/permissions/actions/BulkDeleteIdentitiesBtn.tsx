import { FC, useState } from "react";
import {
  ButtonProps,
  ConfirmationButton,
  Notification,
  useNotify,
} from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import { deleteIdentities } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";
import { useIdentityEntitlements } from "util/entitlements/identities";

interface Props {
  identities: LxdIdentity[];
  className?: string;
}

const BulkDeleteIdentitiesBtn: FC<Props & ButtonProps> = ({
  identities,
  className,
}) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const buttonText = `Delete ${pluralize("identity", identities.length)}`;
  const [isLoading, setLoading] = useState(false);
  const { canDeleteIdentity } = useIdentityEntitlements();

  const restrictedIdentities: LxdIdentity[] = [];
  const deletableIdentities: LxdIdentity[] = [];
  identities.forEach((identity) => {
    if (canDeleteIdentity(identity)) {
      deletableIdentities.push(identity);
    } else {
      restrictedIdentities.push(identity);
    }
  });

  const handleDelete = () => {
    setLoading(true);
    const successMessage = `${deletableIdentities.length} ${pluralize("identity", deletableIdentities.length)} successfully deleted`;
    deleteIdentities(deletableIdentities)
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });
        toastNotify.success(successMessage);
        setLoading(false);
        close();
      })
      .catch((e) => {
        notify.failure(`Identity deletion failed`, e);
        setLoading(false);
      });
  };

  const getDeleteConfirmationMessage = () => {
    if (!deletableIdentities.length) {
      return (
        <Notification
          severity="caution"
          title="Restricted permissions"
          titleElement="h2"
        >
          You do not have permission to delete the selected identities
        </Notification>
      );
    }

    return (
      <p>
        This will permanently delete the following{" "}
        {pluralize("identity", deletableIdentities.length)}:
        <ul>
          {deletableIdentities.map((identity) => (
            <li key={identity.name}>{identity.name}</li>
          ))}
        </ul>
        You do not have permission to delete the following{" "}
        {pluralize("identity", deletableIdentities.length)}:
        <ul>
          {restrictedIdentities.map((identity) => (
            <li key={identity.name}>{identity.name}</li>
          ))}
        </ul>
        This action cannot be undone, and can result in data loss.
      </p>
    );
  };

  return (
    <ConfirmationButton
      onHoverText={buttonText}
      appearance=""
      aria-label="Delete identities"
      className={className}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: getDeleteConfirmationMessage(),
        confirmButtonLabel: "Delete",
        confirmButtonDisabled: !deletableIdentities.length,
        onConfirm: handleDelete,
      }}
      disabled={!identities.length}
      shiftClickEnabled
      showShiftClickHint={!!deletableIdentities.length}
    >
      {buttonText}
    </ConfirmationButton>
  );
};

export default BulkDeleteIdentitiesBtn;
