import {
  ActionButton,
  Input,
  Modal,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGroup, deleteGroups } from "api/auth-groups";
import { useToastNotification } from "context/toastNotificationProvider";
import { ChangeEvent, FC, useState } from "react";
import { LxdGroup } from "types/permissions";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";

interface Props {
  groups: LxdGroup[];
  close: () => void;
}

const DeleteGroupModal: FC<Props> = ({ groups, close }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [confirmInput, setConfirmInput] = useState("");
  const [disableConfirm, setDisableConfirm] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const hasOneGroup = groups.length === 1;
  const confirmText = "confirm-delete-group";

  const handleConfirmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === confirmText) {
      setDisableConfirm(false);
    } else {
      setDisableConfirm(true);
    }

    setConfirmInput(e.target.value);
  };

  const handleDeleteGroups = () => {
    setSubmitting(true);
    const hasSingleGroup = groups.length === 1;
    const mutationPromise = hasSingleGroup
      ? deleteGroup(groups[0].name)
      : deleteGroups(groups.map((group) => group.name));

    const successMessage = hasSingleGroup
      ? `Group ${groups[0].name} deleted.`
      : `${groups.length} groups deleted.`;

    mutationPromise
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });
        toastNotify.success(successMessage);
        close();
      })
      .catch((e) => {
        notify.failure(
          `${pluralize("group", groups.length)} deletion failed`,
          e,
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Modal
      title="Confirm group deletion"
      className="delete-group-confirm-modal"
      close={close}
      buttonRow={[
        <span className="u-float-left confirm-input" key="confirm-input">
          <Input
            id="confirm-delete-group-input"
            name="confirm-delete-group-input"
            type="text"
            onChange={handleConfirmInputChange}
            value={confirmInput}
            placeholder={confirmText}
            className="u-no-margin--bottom"
          />
        </span>,
        <ActionButton
          key="confirm-action-button"
          appearance="negative"
          className="u-no-margin--bottom"
          onClick={handleDeleteGroups}
          loading={submitting}
          disabled={disableConfirm}
        >
          {`Permanently delete ${groups.length} ${pluralize("group", groups.length)}`}
        </ActionButton>,
      ]}
    >
      <p>
        Are you sure you want to permanently delete{" "}
        <strong>
          {hasOneGroup ? groups[0].name : `${groups.length} groups`}
        </strong>
        ?
      </p>
      <p>
        This action cannot be undone and may result in users losing access to
        LXD, including the possibility that all users lose admin access.
      </p>
      <p>To continue, please type the confirmation text below.</p>
      <p>
        <strong>{confirmText}</strong>
      </p>
    </Modal>
  );
};

export default DeleteGroupModal;
