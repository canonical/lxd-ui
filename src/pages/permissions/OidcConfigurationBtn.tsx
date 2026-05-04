import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import OidcConfigurationModal from "pages/permissions/OidcConfigurationModal";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  isDisabled?: boolean;
  className?: string;
  onClose?: () => void;
}

const OidcConfigurationBtn: FC<Props> = ({
  isDisabled,
  className,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditServerConfiguration } = useServerEntitlements();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <OidcConfigurationModal close={handleClose} />
        </Portal>
      )}
      <Button
        onClick={openPortal}
        className={className}
        disabled={isDisabled || !canEditServerConfiguration()}
        title={
          canEditServerConfiguration()
            ? ""
            : "You do not have permission to edit server configuration"
        }
        hasIcon
      >
        <Icon name="security" className="auth-option-icon" />
        <span>Configure single sign-on</span>
      </Button>
    </>
  );
};

export default OidcConfigurationBtn;
