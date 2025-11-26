import type { FC } from "react";
import type { LxdProfile } from "types/profile";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classnames from "classnames";
import CopyProfileForm from "../forms/CopyProfileForm";

interface Props {
  profile: LxdProfile;
  className?: string;
  onClose?: () => void;
}

const CopyProfileBtn: FC<Props> = ({ profile, className, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <CopyProfileForm close={handleClose} profile={profile} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Copy profile"
        className={classnames("u-no-margin--bottom has-icon", className)}
        onClick={openPortal}
        title={"Copy profile"}
      >
        <Icon name="canvas" />
        <span>Copy</span>
      </Button>
    </>
  );
};

export default CopyProfileBtn;
