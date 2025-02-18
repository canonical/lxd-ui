import {
  ActionButton,
  Input,
  Modal,
  Notification,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGroups } from "api/auth-groups";
import ResourceLabel from "components/ResourceLabel";
import { useToastNotification } from "context/toastNotificationProvider";
import { ChangeEvent, FC, useState } from "react";
import type { LxdGroup } from "types/permissions";
import { useGroupEntitlements } from "util/entitlements/groups";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import LoggedInUserNotification from "../panels/LoggedInUserNotification";
import { useSettings } from "context/useSettings";

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
  const confirmText = "confirm-delete-group";
  const { canDeleteGroup } = useGroupEntitlements();
  const { data: settings } = useSettings();
  const loggedInIdentityID = settings?.auth_user_name ?? "";

  const restrictedGroups: LxdGroup[] = [];
  const deletableGroups: LxdGroup[] = [];
  let hasGroupsForLoggedInUser = false;
  groups.forEach((group) => {
    if (canDeleteGroup(group)) {
      deletableGroups.push(group);
    } else {
      restrictedGroups.push(group);
    }

    if (group.identities?.oidc?.includes(loggedInIdentityID)) {
      hasGroupsForLoggedInUser = true;
    }

    if (group.identities?.tls?.includes(loggedInIdentityID)) {
      hasGroupsForLoggedInUser = true;
    }
  });

  const hasOneGroup = deletableGroups.length === 1;

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
          `Failed deleting ${deletableGroups.length} ${pluralize("group", deletableGroups.length)}.`,
          e,
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const getModalContent = () => {
    return (
      <>
        <p>
          Are you sure you want to permanently delete{" "}
          <strong>
            {hasOneGroup
              ? deletableGroups[0].name
              : `${deletableGroups.length} groups`}
          </strong>
          ?
        </p>
        {hasGroupsForLoggedInUser && (
          <div className="u-sv1">
            <LoggedInUserNotification isVisible={hasGroupsForLoggedInUser} />
          </div>
        )}
        {restrictedGroups.length ? (
          <div className="u-sv1">
            <Notification
              severity="information"
              title="Restricted permissions"
              titleElement="h2"
              className="u-no-margin--bottom"
            >
              <p className="u-no-margin--bottom">
                You do not have permission to delete the following groups:
              </p>
              <ul className="u-no-margin--bottom">
                {restrictedGroups.map((group) => (
                  <li key={group.name}>{group.name}</li>
                ))}
              </ul>
            </Notification>
          </div>
        ) : null}
        <p>
          This action cannot be undone and may result in users losing access to
          LXD, including the possibility that all users lose admin access.
        </p>
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
            value={confirmInput}
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
          disabled={disableConfirm}
        >
          {`Permanently delete ${deletableGroups.length} ${pluralize("group", deletableGroups.length)}`}
        </ActionButton>,
      ]}
    >
      {getModalContent()}
    </Modal>
  );
};

export default DeleteGroupModal;
