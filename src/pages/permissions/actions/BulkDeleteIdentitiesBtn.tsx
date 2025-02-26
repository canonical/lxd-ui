import { FC, useState } from "react";
import { useNotify } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import { deleteIdentities } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";
import { useIdentityEntitlements } from "util/entitlements/identities";
import BulkDeleteButton from "components/BulkDeleteButton";

interface Props {
  identities: LxdIdentity[];
}

const BulkDeleteIdentitiesBtn: FC<Props> = ({ identities }) => {
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
        queryClient.invalidateQueries({
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

  const getBulkDeleteBreakdown = () => {
    if (!restrictedIdentities.length) {
      return undefined;
    }

    return [
      `${deletableIdentities.length} ${pluralize("identity", deletableIdentities.length)} will be deleted.`,
      `${restrictedIdentities.length} ${pluralize("identity", restrictedIdentities.length)} that you do not have permission to delete will be ignored.`,
    ];
  };

  return (
    <BulkDeleteButton
      entities={identities}
      deletableEntities={deletableIdentities}
      entityType="identity"
      onDelete={handleDelete}
      disabledReason={
        !deletableIdentities.length
          ? `You do not have permission to delete the selected ${pluralize("identity", identities.length)}`
          : undefined
      }
      className="u-no-margin--bottom"
      confirmationButtonProps={{
        loading: isLoading,
      }}
      buttonLabel={buttonText}
      bulkDeleteBreakdown={getBulkDeleteBreakdown()}
    />
  );
};

export default BulkDeleteIdentitiesBtn;
