import { FC } from "react";
import { LxdInstance } from "types/instance";
import { ActionButton } from "@canonical/react-components";
import usePortal from "react-useportal";
import CreateImageFromInstanceForm from "../forms/CreateImageFromInstanceForm";
import { useInstanceLoading } from "context/instanceLoading";

interface Props {
  instance: LxdInstance;
}

const CreateImageFromInstanceBtn: FC<Props> = ({ instance }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const instanceLoading = useInstanceLoading();
  const prohibitedStatuses = ["Error", "Frozen", "Running"];

  const isDisabled =
    prohibitedStatuses.includes(instance?.status) ||
    Boolean(instanceLoading.getType(instance));

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateImageFromInstanceForm
            close={closePortal}
            instance={instance}
          />
        </Portal>
      )}
      <ActionButton
        appearance="default"
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
