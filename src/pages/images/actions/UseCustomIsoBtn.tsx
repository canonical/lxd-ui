import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import type { LxdImageType, RemoteImage } from "types/image";
import CustomIsoModal from "pages/images/CustomIsoModal";

interface Props {
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
}

const UseCustomIsoBtn: FC<Props> = ({ onSelect }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleSelect = (image: RemoteImage, type?: LxdImageType) => {
    closePortal();
    onSelect(image, type);
  };

  return (
    <>
      <Button onClick={openPortal} type="button" id="select-custom-iso">
        <span>Use custom ISO</span>
      </Button>
      {isOpen && (
        <Portal>
          <CustomIsoModal onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default UseCustomIsoBtn;
