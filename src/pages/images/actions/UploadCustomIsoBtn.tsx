import { FC } from "react";
import { Button, Modal } from "@canonical/react-components";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import usePortal from "react-useportal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  className?: string;
}

const UploadCustomIsoBtn: FC<Props> = ({ className }) => {
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();

  const handleCancel = () => closePortal();

  const handleFinish = (name: string) => {
    toastNotify.success(
      <>
        Image <b>{name}</b> uploaded successfully
      </>,
    );
    void queryClient.invalidateQueries({ queryKey: [queryKeys.isoVolumes] });
    closePortal();
  };

  return (
    <>
      <Button appearance="positive" onClick={openPortal} className={className}>
        Upload custom ISO
      </Button>
      {isOpen && (
        <Portal>
          <Modal close={closePortal} title="Upload custom ISO">
            <UploadCustomIso onCancel={handleCancel} onFinish={handleFinish} />
          </Modal>
        </Portal>
      )}
    </>
  );
};

export default UploadCustomIsoBtn;
