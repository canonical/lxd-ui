import { Button, Icon } from "@canonical/react-components";
import { useSmallScreen } from "context/useSmallScreen";
import type { FC } from "react";
import { usePortal } from "@canonical/react-components";
import CreateIdentityModal from "./CreateIdentityModal";
import { useServerEntitlements } from "util/entitlements/server";

const CreateTlsIdentityBtn: FC = () => {
  const isSmallScreen = useSmallScreen();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canCreateIdentities } = useServerEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateIdentityModal onClose={closePortal} />
        </Portal>
      )}
      <Button
        appearance="positive"
        className="u-float-right u-no-margin--bottom"
        onClick={openPortal}
        hasIcon={!isSmallScreen}
        title={
          canCreateIdentities()
            ? ""
            : "You do not have permission to create identities"
        }
        disabled={!canCreateIdentities()}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>Create TLS Identity</span>
      </Button>
    </>
  );
};

export default CreateTlsIdentityBtn;
