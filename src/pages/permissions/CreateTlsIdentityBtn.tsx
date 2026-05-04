import { Button, Icon } from "@canonical/react-components";
import type { FC } from "react";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  openPanel: () => void;
  className?: string;
  onClose?: () => void;
}

const CreateTlsIdentityBtn: FC<Props> = ({ openPanel, className, onClose }) => {
  const { canCreateIdentities } = useServerEntitlements();

  const handleClick = () => {
    openPanel();
    onClose?.();
  };

  const buttonClassName = className || "u-float-right u-no-margin--bottom";
  const appearance = className?.includes("p-contextual-menu__link")
    ? "base"
    : "positive";

  return (
    <>
      <Button
        appearance={appearance}
        className={buttonClassName}
        onClick={handleClick}
        hasIcon
        title={
          canCreateIdentities()
            ? ""
            : "You do not have permission to create identities"
        }
        disabled={!canCreateIdentities()}
      >
        <Icon name="plus" light />
        <span>Create TLS Identity</span>
      </Button>
    </>
  );
};

export default CreateTlsIdentityBtn;
