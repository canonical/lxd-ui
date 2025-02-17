import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import DeleteIdpGroupsModal from "./DeleteIdpGroupsModal";
import { usePortal } from "@canonical/react-components";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";

interface Props {
  idpGroup: IdpGroup;
}

const DeleteIdpGroupBtn: FC<Props> = ({ idpGroup }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canDeleteGroup } = useIdpGroupEntitlements();

  return (
    <>
      <Button
        appearance="base"
        hasIcon
        dense
        onClick={openPortal}
        type="button"
        aria-label="Delete IDP group"
        title={
          canDeleteGroup()
            ? "Delete IDP group"
            : "You do not have permission to delete this IDP group"
        }
        disabled={!canDeleteGroup(idpGroup)}
      >
        <Icon name="delete" />
      </Button>
      {isOpen && (
        <Portal>
          <DeleteIdpGroupsModal idpGroups={[idpGroup]} close={closePortal} />
        </Portal>
      )}
    </>
  );
};

export default DeleteIdpGroupBtn;
