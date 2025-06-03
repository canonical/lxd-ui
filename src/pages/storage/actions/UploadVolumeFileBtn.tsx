import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import UploadVolumeFileModal from "../forms/UploadVolumeFileModal";

interface Props {
  name?: string;
}

const UploadVolumeFileBtn: FC<Props> = ({ name }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      <Button onClick={openPortal} type="button">
        <span>Upload volume file</span>
      </Button>
      {isOpen && (
        <Portal>
          <UploadVolumeFileModal close={closePortal} name={name} />
          <div></div>
        </Portal>
      )}
    </>
  );
};

export default UploadVolumeFileBtn;
