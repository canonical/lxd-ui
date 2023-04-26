import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import UploadIsoImage from "pages/storage/UploadIsoImage";

interface Props {
  onFinish: (name: string, pool: string) => void;
}

const UploadIsoBtn: FC<Props> = ({ onFinish }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleSelect = (name: string, pool: string) => {
    closePortal();
    onFinish(name, pool);
  };

  return (
    <>
      <Button appearance="default" onClick={openPortal} type="button">
        <span>Upload ISO</span>
      </Button>
      {isOpen && (
        <Portal>
          <UploadIsoImage onCancel={closePortal} onFinish={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default UploadIsoBtn;
