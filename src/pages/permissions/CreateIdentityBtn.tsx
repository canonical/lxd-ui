import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { useServerEntitlements } from "util/entitlements/server";
import DsIcon from "components/DsIcon";

interface Props {
  openPanel: () => void;
  className?: string;
  onClose?: () => void;
}

const CreateIdentityBtn: FC<Props> = ({ openPanel, className, onClose }) => {
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
      <DsIcon icon="plus" />
      <span>Create identity</span>
    </Button>
  );
};

export default CreateIdentityBtn;
