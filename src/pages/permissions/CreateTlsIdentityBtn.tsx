import { Button, Icon } from "@canonical/react-components";
import { useSmallScreen } from "context/useSmallScreen";
import { FC } from "react";
import { usePortal } from "@canonical/react-components";
import CreateIdentityModal from "./CreateIdentityModal";

const CreateTlsIdentityBtn: FC = () => {
  const isSmallScreen = useSmallScreen();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

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
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>Create TLS Identity</span>
      </Button>
    </>
  );
};

export default CreateTlsIdentityBtn;
