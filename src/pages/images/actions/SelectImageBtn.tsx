import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import { RemoteImage } from "types/image";
import ImageSelectorModal from "pages/images/ImageSelectorModal";

interface Props {
  appearance: string;
  caption: string;
  onSelect: (image: RemoteImage, type: string | null) => void;
}

const SelectImageBtn: FC<Props> = ({ appearance, caption, onSelect }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleSelect = (image: RemoteImage, type: string | null) => {
    closePortal();
    onSelect(image, type);
  };

  return (
    <>
      <Button appearance={appearance} onClick={openPortal} type="button">
        <span>{caption}</span>
      </Button>
      {isOpen && (
        <Portal>
          <ImageSelectorModal onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default SelectImageBtn;
