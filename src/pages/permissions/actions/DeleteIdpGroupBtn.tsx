import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import DeleteIdpGroupsModal from "./DeleteIdpGroupsModal";
import usePortal from "react-useportal";

interface Props {
  idpGroup: IdpGroup;
}

const DeleteIdpGroupBtn: FC<Props> = ({ idpGroup }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      <Button
        appearance="base"
        hasIcon
        dense
        onClick={openPortal}
        type="button"
        aria-label="Delete IDP group"
        title="Delete IDP group"
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
