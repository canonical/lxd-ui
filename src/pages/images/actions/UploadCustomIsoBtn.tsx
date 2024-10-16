import { FC } from "react";
import { Button, Modal } from "@canonical/react-components";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import usePortal from "react-useportal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLink from "components/ResourceLink";

interface Props {
  className?: string;
  project: string;
}

const UploadCustomIsoBtn: FC<Props> = ({ className, project }) => {
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();

  const handleCancel = () => closePortal();

  const handleFinish = (name: string) => {
    toastNotify.success(
      <>
        Custom ISO{" "}
        <ResourceLink
          to={`/ui/project/${project}/storage/custom-isos`}
          type="iso-volume"
          value={name}
        />{" "}
        uploaded successfully.
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
