import React, { FC } from "react";
import { Button, Modal, useNotify } from "@canonical/react-components";
import UploadIsoImage from "pages/storage/UploadIsoImage";
import usePortal from "react-useportal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

const UploadCustomImageBtn: FC = () => {
  const notify = useNotify();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();

  const handleCancel = () => closePortal();

  const handleFinish = (name: string) => {
    notify.success(
      <>
        Image <b>{name}</b> uploaded successfully
      </>
    );
    void queryClient.invalidateQueries([queryKeys.isoImages]);
    closePortal();
  };

  return (
    <>
      <Button appearance="positive" onClick={openPortal}>
        Upload custom image
      </Button>
      {isOpen && (
        <Portal>
          <Modal close={closePortal} title="Upload custom image">
            <UploadIsoImage onCancel={handleCancel} onFinish={handleFinish} />
          </Modal>
        </Portal>
      )}
    </>
  );
};

export default UploadCustomImageBtn;
