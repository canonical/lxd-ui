import { FC } from "react";
import { LxdInstance } from "types/instance";
import { ActionButton } from "@canonical/react-components";
import usePortal from "react-useportal";
import CreateImageFromInstanceForm from "../forms/CreateImageFromInstanceForm";
import { useInstanceLoading } from "context/instanceLoading";
import classNames from "classnames";

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
  const instanceLoading = useInstanceLoading();
  const prohibitedStatuses = ["Error", "Frozen", "Running"];

  const isDisabled =
    prohibitedStatuses.includes(instance?.status) ||
    Boolean(instanceLoading.getType(instance));

  const handleClose = () => {
    closePortal();
    onClose?.();
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
        className={classNames("u-no-margin--bottom", classname)}
        onClick={openPortal}
        aria-label="Create image"
        title={
          isDisabled ? "Stop the instance to create an image" : "Create image"
        }
        disabled={isDisabled}
      >
        <span>Create Image</span>
      </ActionButton>
    </>
  );
};

export default CreateImageFromInstanceBtn;
