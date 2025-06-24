import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classNames from "classnames";
import { useInstanceEntitlements } from "util/entitlements/instances";
import ExportInstanceModal from "pages/instances/forms/ExportInstanceModal";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
}

const ExportInstanceBtn: FC<Props> = ({ instance, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageInstanceBackups } = useInstanceEntitlements();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <ExportInstanceModal close={handleClose} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        onClick={openPortal}
        title={
          canManageInstanceBackups(instance)
            ? "Export instance"
            : "You do not have permission to export this instance."
        }
        disabled={!canManageInstanceBackups(instance)}
      >
        <Icon name="export" />
        <span>Export</span>
      </Button>
    </>
  );
};

export default ExportInstanceBtn;
