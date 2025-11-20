import {
  ActionButton,
  Input,
  Modal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGroups } from "api/auth-groups";
import ResourceLabel from "components/ResourceLabel";
import type { ChangeEvent, FC } from "react";
import { useState } from "react";
import type { LxdAuthGroup } from "types/permissions";
import { useGroupEntitlements } from "util/entitlements/groups";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import LoggedInUserNotification from "../panels/LoggedInUserNotification";
import { useSettings } from "context/useSettings";

interface Props {
  groups: LxdAuthGroup[];
  close: () => void;
}

const DeleteGroupModal: FC<Props> = ({ groups, close }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [disableConfirm, setDisableConfirm] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const confirmText = "confirm-delete-group";
  const { canDeleteGroup } = useGroupEntitlements();
  const { data: settings } = useSettings();
  const loggedInIdentityID = settings?.auth_user_name ?? "";

  const restrictedGroups: LxdAuthGroup[] = [];
  const deletableGroups: LxdAuthGroup[] = [];
  let hasGroupsForLoggedInUser = false;
  groups.forEach((group) => {
    if (canDeleteGroup(group)) {
      if (group.identities?.oidc?.includes(loggedInIdentityID)) {
        hasGroupsForLoggedInUser = true;
      }

      if (group.identities?.tls?.includes(loggedInIdentityID)) {
        hasGroupsForLoggedInUser = true;
      }

      deletableGroups.push(group);
    } else {
      restrictedGroups.push(group);
    }
  });

  const hasOneGroup = deletableGroups.length === 1;

  const handleConfirmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisableConfirm(e.target.value !== confirmText);
  };

  const handleDeleteGroups = () => {
    setSubmitting(true);
    const hasSingleGroup = deletableGroups.length === 1;

    const successMessage = hasSingleGroup ? (
      <>
        Group{" "}
        <ResourceLabel bold type="auth-group" value={deletableGroups[0].name} />{" "}
        deleted.
      </>
    ) : (
      `${deletableGroups.length} groups deleted.`
    );

    deleteGroups(deletableGroups.map((group) => group.name))
      .then(() => {
        queryClient.invalidateQueries({
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
          `Failed deleting ${deletableGroups.length} ${pluralize("group", deletableGroups.length)}.`,
          e,
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const getModalContent = () => {
    const breakdown = restrictedGroups.length ? (
      <>
        <li className="p-list__item">
          -{" "}
          {`${deletableGroups.length} ${pluralize("group", deletableGroups.length)} will be deleted.`}
        </li>
        <li className="p-list__item">
          -{" "}
          {`${restrictedGroups.length} ${pluralize("group", restrictedGroups.length)} that you do not have permission to delete will be ignored.`}
        </li>
      </>
    ) : null;

    const deleteText = hasOneGroup ? (
      <>
        {" "}
        the group{" "}
        <ResourceLabel type="auth-group" value={deletableGroups[0].name} bold />
      </>
    ) : (
      <>
        <strong>{deletableGroups.length}</strong>{" "}
        {pluralize("group", deletableGroups.length)}
      </>
    );

    return (
      <>
        {breakdown && (
          <>
            <p>
              <b>{groups.length}</b> {pluralize("group", groups.length)}{" "}
              selected:
            </p>
            <ul className="p-list">{breakdown}</ul>
          </>
        )}
        <p className="u-no-padding--top">
          This will permanently delete {deleteText}.{"\n"}This action cannot be
          undone and may result in users losing access to LXD, including the
          possibility that all users lose admin access.
        </p>
        {hasGroupsForLoggedInUser && (
          <div className="u-sv1">
            <LoggedInUserNotification isVisible={hasGroupsForLoggedInUser} />
          </div>
        )}
        <p>To continue, please type the confirmation text below.</p>
        <p>
          <strong>{confirmText}</strong>
        </p>
      </>
    );
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
            placeholder={confirmText}
            className="u-no-margin--bottom"
            disabled={!deletableGroups.length}
          />
        </span>,
        <ActionButton
          key="confirm-action-button"
          appearance="negative"
          className="u-no-margin--bottom"
          onClick={handleDeleteGroups}
          loading={submitting}
          disabled={disableConfirm || submitting}
        >
          Permanently delete {deletableGroups.length}{" "}
          {pluralize("group", deletableGroups.length)}
        </ActionButton>,
      ]}
    >
      {getModalContent()}
    </Modal>
  );
};

export default DeleteGroupModal;
