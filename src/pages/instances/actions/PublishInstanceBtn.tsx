import { FC } from "react";
import { LxdInstance } from "types/instance";
import { ActionButton } from "@canonical/react-components";
import usePortal from "react-useportal";
import PublishInstanceForm from "../forms/PublishInstanceForm";

interface Props {
  instance: LxdInstance;
}

const PublishInstanceBtn: FC<Props> = ({ instance }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <PublishInstanceForm close={closePortal} instance={instance} />
        </Portal>
      )}
      <ActionButton
        appearance={"default"}
        onClick={openPortal}
        aria-label="Publish instance"
        title="Publish instance"
      >
        <span>Publish</span>
      </ActionButton>
    </>
  );
};

export default PublishInstanceBtn;
