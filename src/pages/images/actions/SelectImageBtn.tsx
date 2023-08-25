import React, { FC, ReactNode } from "react";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import { RemoteImage } from "types/image";
import ImageSelectorModal from "pages/images/ImageSelectorModal";

interface Props {
  appearance: string;
  caption: ReactNode;
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
      <Button
        appearance={appearance}
        onClick={openPortal}
        type="button"
        id="base-image"
        className="image-btn"
      >
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
