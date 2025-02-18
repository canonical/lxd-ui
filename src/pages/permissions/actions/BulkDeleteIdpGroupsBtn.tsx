import { FC } from "react";
import {
  ConfirmationButton,
  Icon,
  Notification,
} from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import { pluralize } from "util/instanceBulkActions";
import { useDeleteIdpGroups } from "util/permissionIdpGroups";

interface Props {
  idpGroups: IdpGroup[];
}

const BulkDeleteIdpGroupsBtn: FC<Props> = ({ idpGroups }) => {
  const {
    isDeleting,
    deletableIdpGroups,
    restrictedIdpGroups,
    deleteIdpGroups,
  } = useDeleteIdpGroups(idpGroups);

  const hasOneGroup = deletableIdpGroups.length === 1;

  return (
    <ConfirmationButton
      onHoverText={
        deletableIdpGroups.length
          ? "Delete IDP groups"
          : `You do not have permission to delete the selected ${pluralize("idp group", idpGroups.length)}`
      }
      className="has-icon u-no-margin--bottom"
      aria-label="Delete IDP groups"
      disabled={!deletableIdpGroups.length}
      shiftClickEnabled
      showShiftClickHint
      confirmationModalProps={{
        title: "Confirm IDP group deletion",
        confirmButtonLabel: "Delete",
        confirmButtonLoading: isDeleting,
        onConfirm: deleteIdpGroups,
        className: "permission-confirm-modal",
        children: (
          <>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {hasOneGroup
                  ? `"${deletableIdpGroups[0].name}"`
                  : `${deletableIdpGroups.length} IDP groups`}
              </strong>
              ? This action is permanent and can not be undone.
            </p>
            {restrictedIdpGroups.length ? (
              <Notification
                severity="caution"
                title="Restricted permissions"
                titleElement="h2"
              >
                <p className="u-no-margin--bottom">
                  You do not have permission to delete the following IDP groups:
                </p>
                <ul className="u-no-margin--bottom">
                  {restrictedIdpGroups.map((group) => (
                    <li key={group.name}>{group.name}</li>
                  ))}
                </ul>
              </Notification>
            ) : null}
          </>
        ),
      }}
    >
      <Icon name="delete" />
      <span>{`Delete ${idpGroups.length} ${pluralize("IDP group", idpGroups.length)}`}</span>
    </ConfirmationButton>
  );
};

export default BulkDeleteIdpGroupsBtn;
