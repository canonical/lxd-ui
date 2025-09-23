import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classNames from "classnames";
import { useInstanceEntitlements } from "util/entitlements/instances";
import ExportInstanceModal from "pages/instances/forms/ExportInstanceModal";
import { useCurrentProject } from "context/useCurrentProject";
import { isBackupDisabled } from "util/snapshots";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
}

const ExportInstanceBtn: FC<Props> = ({ instance, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageInstanceBackups } = useInstanceEntitlements();
  const { project } = useCurrentProject();
  const backupDisabled = isBackupDisabled(project);

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getTitle = () => {
    if (!canManageInstanceBackups(instance)) {
      return "You do not have permission to export this instance.";
    }

    if (backupDisabled) {
      return `Project "${project?.name}" doesn't allow for backup creation.`;
    }

    return "Export instance";
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
        title={getTitle()}
        disabled={!canManageInstanceBackups(instance) || backupDisabled}
      >
        <Icon name="export" />
        <span>Export</span>
      </Button>
    </>
  );
};

export default ExportInstanceBtn;
