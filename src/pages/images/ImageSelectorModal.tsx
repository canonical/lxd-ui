import React, { FC, useState } from "react";
import { Modal } from "@canonical/react-components";
import { RemoteImage } from "types/image";
import ImageSelector from "pages/images/ImageSelector";
import UploadCustomImage from "pages/storage/UploadCustomImage";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage, type: string | null) => void;
}

export interface IsoImage {
  name: string;
  pool: string;
}

const SELECT = "select";
const UPLOAD = "upload";

const ImageSelectorModal: FC<Props> = ({ onClose, onSelect }) => {
  const [content, setContent] = useState(SELECT);
  const [primary, setPrimary] = useState<IsoImage | null>(null);

  return (
    <Modal
      close={onClose}
      title={content === SELECT ? "Select base image" : "Upload custom image"}
      className={content === SELECT ? "image-select-modal" : null}
    >
      {content === SELECT && (
        <ImageSelector
          primaryImage={primary}
          onSelect={onSelect}
          onUpload={() => setContent(UPLOAD)}
        />
      )}
      {content === UPLOAD && (
        <UploadCustomImage
          onCancel={() => setContent(SELECT)}
          onFinish={(name, pool) => {
            setContent(SELECT);
            setPrimary({ name, pool });
          }}
        />
      )}
    </Modal>
  );
};

export default ImageSelectorModal;
