import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { ActionButton, Icon, usePortal } from "@canonical/react-components";
import CreateImageFromInstanceForm from "../forms/CreateImageFromInstanceForm";
import { useInstanceLoading } from "context/instanceLoading";
import classNames from "classnames";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
}

const CreateImageFromInstanceBtn: FC<Props> = ({
  instance,
  classname,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { data: project } = useProject(instance.project);
  const { canCreateImages } = useProjectEntitlements();
  const instanceLoading = useInstanceLoading();
  const prohibitedStatuses = ["Error", "Frozen", "Running"];

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getDisabledReason = () => {
    if (!canCreateImages(project)) {
      return `You do not have permission to create images in this project`;
    }

    const isDisabled =
      prohibitedStatuses.includes(instance?.status) ||
      Boolean(instanceLoading.getType(instance));

    if (isDisabled) {
      return "Stop the instance to create an image";
    }

    return "";
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateImageFromInstanceForm
            close={handleClose}
            instance={instance}
          />
        </Portal>
      )}
      <ActionButton
        appearance="default"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        onClick={openPortal}
        aria-label="Create image"
        title={getDisabledReason() || "Create image"}
        disabled={Boolean(getDisabledReason())}
      >
        <Icon name="plus" />
        <span>Create Image</span>
      </ActionButton>
    </>
  );
};

export default CreateImageFromInstanceBtn;
