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

const REMOTE_IMAGES = "remoteImages";
const UPLOAD = "upload";

const ImageSelectorModal: FC<Props> = ({ onClose, onSelect }) => {
  const [content, setContent] = useState(REMOTE_IMAGES);
  const [primary, setPrimary] = useState<IsoImage | null>(null);

  return (
    <Modal
      close={onClose}
      title={
        content === REMOTE_IMAGES ? "Select base image" : "Upload custom image"
      }
      className={content === REMOTE_IMAGES ? "image-select-modal" : null}
    >
      {content === REMOTE_IMAGES && (
        <ImageSelector
          primaryImage={primary}
          onSelect={onSelect}
          onUpload={() => setContent(UPLOAD)}
        />
      )}
      {content === UPLOAD && (
        <UploadCustomImage
          onCancel={() => setContent(REMOTE_IMAGES)}
          onFinish={(name, pool) => {
            setContent(REMOTE_IMAGES);
            setPrimary({ name, pool });
          }}
        />
      )}
    </Modal>
  );
};

export default ImageSelectorModal;
