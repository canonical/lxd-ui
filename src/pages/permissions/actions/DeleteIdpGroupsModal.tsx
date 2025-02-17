import {
  ConfirmationModal,
  Notification,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteIdpGroup, deleteIdpGroups } from "api/auth-idp-groups";
import ResourceLabel from "components/ResourceLabel";
import { useToastNotification } from "context/toastNotificationProvider";
import { FC, useState } from "react";
import type { IdpGroup } from "types/permissions";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";

interface Props {
  idpGroups: IdpGroup[];
  close: () => void;
}

const DeleteIdpGroupsModal: FC<Props> = ({ idpGroups, close }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [submitting, setSubmitting] = useState(false);
  const { canDeleteGroup } = useIdpGroupEntitlements();

  const restrictedGroups: IdpGroup[] = [];
  const deletableGroups: IdpGroup[] = [];
  idpGroups.forEach((group) => {
    if (canDeleteGroup(group)) {
      deletableGroups.push(group);
    } else {
      restrictedGroups.push(group);
    }
  });

  const hasOneGroup = deletableGroups.length === 1;

  const handleDeleteIdpGroups = () => {
    setSubmitting(true);
    const mutationPromise = hasOneGroup
      ? deleteIdpGroup(deletableGroups[0].name)
      : deleteIdpGroups(deletableGroups.map((group) => group.name));

    const successMessage = hasOneGroup ? (
      <>
        IDP group{" "}
        <ResourceLabel bold type="idp-group" value={deletableGroups[0].name} />{" "}
        deleted.
      </>
    ) : (
      `${deletableGroups.length} IDP groups deleted.`
    );

    mutationPromise
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.idpGroups],
        });
        toastNotify.success(successMessage);
        close();
      })
      .catch((e) => {
        notify.failure(
          `${pluralize("IDP group", deletableGroups.length)} deletion failed`,
          e,
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <ConfirmationModal
      confirmButtonLabel="Delete"
      onConfirm={handleDeleteIdpGroups}
      close={close}
      title="Confirm IDP group deletion"
      confirmButtonLoading={submitting}
      className="permission-confirm-modal"
    >
      <p>
        Are you sure you want to delete{" "}
        <strong>
          {hasOneGroup
            ? `"${deletableGroups[0].name}"`
            : `${deletableGroups.length} IDP groups`}
        </strong>
        ? This action is permanent and can not be undone.
      </p>
      {restrictedGroups.length && (
        <Notification
          severity="caution"
          title="Restricted permissions"
          titleElement="h2"
        >
          <p className="u-no-margin--bottom">
            You do not have permission to delete the following IDP groups:
          </p>
          <ul className="u-no-margin--bottom">
            {restrictedGroups.map((group) => (
              <li key={group.name}>{group.name}</li>
            ))}
          </ul>
        </Notification>
      )}
    </ConfirmationModal>
  );
};

export default DeleteIdpGroupsModal;
