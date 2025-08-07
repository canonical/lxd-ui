import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon, usePortal } from "@canonical/react-components";
import CopyInstanceForm from "../forms/CopyInstanceForm";
import classNames from "classnames";
import { useProject, useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  instance: LxdInstance;
  isLoading: boolean;
  classname?: string;
  onClose?: () => void;
}

const CopyInstanceBtn: FC<Props> = ({
  instance,
  isLoading,
  classname,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { data: currentProject } = useProject(instance.project);
  const { data: allProjects } = useProjects();
  const { canCreateInstances } = useProjectEntitlements();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getDisableReason = () => {
    const validTargetProjects = allProjects?.filter(canCreateInstances);
    // when copying an instance, the user must always have permission to create instances in the source project
    // LXD internally creates a new instance in the source project and then copies it to the target project
    if (!canCreateInstances(currentProject) || !validTargetProjects?.length) {
      return "You do not have permission to copy instances";
    }

    if (isLoading) {
      return "Loading...";
    }

    return "";
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <CopyInstanceForm close={handleClose} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Copy instance"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        disabled={Boolean(getDisableReason())}
        onClick={openPortal}
        title={getDisableReason() || "Copy instance"}
      >
        <Icon name="canvas" />
        <span>Copy</span>
      </Button>
    </>
  );
};

export default CopyInstanceBtn;
