import { FC, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import { pluralize } from "util/instanceBulkActions";
import DeleteIdpGroupsModal from "./DeleteIdpGroupsModal";

interface Props {
  idpGroups: IdpGroup[];
  className?: string;
}

const BulkDeleteIdpGroupsBtn: FC<Props> = ({ idpGroups, className }) => {
  const [confirming, setConfirming] = useState(false);

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
        title="Delete IDP groups"
        className={className}
        appearance="negative"
        hasIcon
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
