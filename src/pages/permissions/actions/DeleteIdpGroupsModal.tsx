import { ConfirmationModal, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteIdpGroup, deleteIdpGroups } from "api/auth-idp-groups";
import ResourceLabel from "components/ResourceLabel";
import { useToastNotification } from "context/toastNotificationProvider";
import { FC, useState } from "react";
import type { IdpGroup } from "types/permissions";
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
  const hasOneGroup = idpGroups.length === 1;

  const handleDeleteIdpGroups = () => {
    setSubmitting(true);
    const mutationPromise = hasOneGroup
      ? deleteIdpGroup(idpGroups[0].name)
      : deleteIdpGroups(idpGroups.map((group) => group.name));

    const successMessage = hasOneGroup ? (
      <>
        IDP group{" "}
        <ResourceLabel bold type="idp-group" value={idpGroups[0].name} />{" "}
        deleted.
      </>
    ) : (
      `${idpGroups.length} IDP groups deleted.`
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
          `${pluralize("IDP group", idpGroups.length)} deletion failed`,
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
            ? `"${idpGroups[0].name}"`
            : `${idpGroups.length} IDP groups`}
        </strong>
        ? This action is permanent and can not be undone.
      </p>
    </ConfirmationModal>
  );
};

export default DeleteIdpGroupsModal;
