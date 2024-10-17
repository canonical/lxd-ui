import { FC } from "react";
import { Button, Icon, Modal } from "@canonical/react-components";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import usePortal from "react-useportal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import { useSmallScreen } from "context/useSmallScreen";

interface Props {
  className?: string;
}

const UploadCustomIsoBtn: FC<Props> = ({ className }) => {
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();
  const isSmallScreen = useSmallScreen();

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
      <Button
        appearance="positive"
        onClick={openPortal}
        className={className}
        hasIcon={!isSmallScreen}
      >
        {!isSmallScreen && <Icon name="upload" light />}
        <span>Upload custom ISO</span>
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
