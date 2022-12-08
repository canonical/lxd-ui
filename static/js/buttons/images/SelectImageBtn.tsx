import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import ImageSelect from "../../modals/ImageSelect";
import usePortal from "react-useportal";
import { RemoteImage } from "../../types/image";

interface Props {
  appearance: string;
  caption: string;
  onSelect: (image: RemoteImage) => void;
}

const SelectImageBtn: FC<Props> = ({ appearance, caption, onSelect }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleSelect = (image: RemoteImage) => {
    closePortal();
    onSelect(image);
  };

  return (
    <>
      <Button appearance={appearance} onClick={openPortal} type="button">
        <span>{caption}</span>
      </Button>
      {isOpen && (
        <Portal>
          <ImageSelect onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default SelectImageBtn;
