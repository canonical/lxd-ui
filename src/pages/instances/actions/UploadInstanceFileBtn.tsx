import { FC } from "react";
import { Button } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import UploadInstanceFileModal from "../forms/UploadInstanceFileModal";

interface Props {
  name?: string;
}

const UploadInstanceFileBtn: FC<Props> = ({ name }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      <Button onClick={openPortal} type="button">
        <span>Upload instance file</span>
      </Button>
      {isOpen && (
        <Portal>
          <UploadInstanceFileModal close={closePortal} name={name} />
        </Portal>
      )}
    </>
  );
};

export default UploadInstanceFileBtn;
