import type { FC } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";
import { useDeleteIdpGroups } from "util/permissionIdpGroups";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  idpGroup: IdpGroup;
}

const DeleteIdpGroupBtn: FC<Props> = ({ idpGroup }) => {
  const { canDeleteIdpGroup } = useIdpGroupEntitlements();
  const { isDeleting, deletableIdpGroups, deleteIdpGroups } =
    useDeleteIdpGroups([idpGroup]);

  return (
    <ConfirmationButton
      onHoverText={
        canDeleteIdpGroup(idpGroup)
          ? "Delete IDP group"
          : "You do not have permission to delete this IDP group"
      }
      appearance="base"
      className="has-icon is-dense"
      aria-label="Delete IDP group"
      type="button"
      disabled={!canDeleteIdpGroup(idpGroup)}
      shiftClickEnabled
      showShiftClickHint
      confirmationModalProps={{
        title: "Confirm IDP group deletion",
        confirmButtonLabel: "Delete",
        confirmButtonLoading: isDeleting,
        onConfirm: deleteIdpGroups,
        className: "permission-confirm-modal",
        children: (
          <p>
            Are you sure you want to delete the IDP group{" "}
            <ResourceLabel
              type="idp-group"
              value={deletableIdpGroups[0]?.name}
              bold
            />
            ?
          </p>
        ),
      }}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteIdpGroupBtn;
