import { FC, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import { pluralize } from "util/instanceBulkActions";
import DeleteIdpGroupsModal from "./DeleteIdpGroupsModal";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";

interface Props {
  idpGroups: IdpGroup[];
  className?: string;
}

const BulkDeleteIdpGroupsBtn: FC<Props> = ({ idpGroups, className }) => {
  const [confirming, setConfirming] = useState(false);
  const { canDeleteGroup } = useIdpGroupEntitlements();
  const deletableGroups = idpGroups.filter(canDeleteGroup);

  const handleConfirmDelete = () => {
    setConfirming(true);
  };

  const handleCloseConfirm = () => {
    setConfirming(false);
  };

  return (
    <>
      <Button
        onClick={handleConfirmDelete}
        aria-label="Delete IDP groups"
        title={
          deletableGroups.length
            ? "Delete IDP groups"
            : `You do not have permission to delete the selected ${pluralize("idp group", idpGroups.length)}`
        }
        className={className}
        appearance="negative"
        hasIcon
        disabled={!deletableGroups.length}
      >
        <Icon name="delete" light />
        <span>{`Delete ${idpGroups.length} ${pluralize("IDP group", idpGroups.length)}`}</span>
      </Button>
      {confirming && (
        <DeleteIdpGroupsModal
          idpGroups={idpGroups}
          close={handleCloseConfirm}
        />
      )}
    </>
  );
};

export default BulkDeleteIdpGroupsBtn;
