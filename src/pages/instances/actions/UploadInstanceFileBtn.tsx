import { FC } from "react";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import UploadInstanceFileModal from "../forms/UploadInstanceFileModal";

const UploadInstanceFileBtn: FC = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      <Button onClick={openPortal} type="button">
        <span>Upload instance file</span>
      </Button>
      {isOpen && (
        <Portal>
          <UploadInstanceFileModal close={closePortal} />
        </Portal>
      )}
    </>
  );
};

export default UploadInstanceFileBtn;
