import { FC, useState } from "react";
import {
  ButtonProps,
  ConfirmationButton,
  useNotify,
} from "@canonical/react-components";
import { LxdIdentity } from "types/permissions";
import { deleteIdentities } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";

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
  const successMessage = `${identities.length} ${pluralize("identity", identities.length)} successfully deleted`;

  const handleDelete = () => {
    setLoading(true);
    deleteIdentities(identities)
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

  return (
    <ConfirmationButton
      onHoverText={buttonText}
      appearance=""
      aria-label="Delete identities"
      className={className}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete the following identities:
            <ul>
              {identities.map((identity) => (
                <li key={identity.name}>{identity.name}</li>
              ))}
            </ul>
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      disabled={!identities.length}
      shiftClickEnabled
      showShiftClickHint
    >
      {buttonText}
    </ConfirmationButton>
  );
};

export default BulkDeleteIdentitiesBtn;
