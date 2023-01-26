import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import ImageSelector from "../ImageSelector";
import usePortal from "react-useportal";
import { RemoteImage } from "types/image";

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
          <ImageSelector onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default SelectImageBtn;
