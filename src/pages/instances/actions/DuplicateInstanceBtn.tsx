import { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import DuplicateInstanceForm from "../forms/DuplicateInstanceForm";
import classNames from "classnames";
import { useProjects } from "context/useProjects";
import { useProjectEntitlementSet } from "util/entitlements/projects";

interface Props {
  instance: LxdInstance;
  isLoading: boolean;
  classname?: string;
  onClose?: () => void;
}

const DuplicateInstanceBtn: FC<Props> = ({
  instance,
  isLoading,
  classname,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { data: projects = [] } = useProjects();
  const { canCreateInstancesSet } = useProjectEntitlementSet(projects);

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getDisableReason = () => {
    // when duplicating an instance, the user must always have permission to create instances in the source project
    // LXD internally creates a new instance in the source project and then copies it to the target project
    if (
      !canCreateInstancesSet.size ||
      !canCreateInstancesSet.has(instance.project)
    ) {
      return "You do not have permission to duplicate instances";
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
          <DuplicateInstanceForm close={handleClose} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Duplicate instance"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        disabled={Boolean(getDisableReason())}
        onClick={openPortal}
        title={getDisableReason() || "Duplicate instance"}
      >
        <Icon name="canvas" />
        <span>Duplicate</span>
      </Button>
    </>
  );
};

export default DuplicateInstanceBtn;
