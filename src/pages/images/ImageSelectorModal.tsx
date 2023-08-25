import React, { FC, useState } from "react";
import { Modal } from "@canonical/react-components";
import { RemoteImage } from "types/image";
import RemoteImageSelector from "pages/images/RemoteImageSelector";
import UploadIsoImage from "pages/storage/UploadIsoImage";

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

const ImageSelector: FC<Props> = ({ onClose, onSelect }) => {
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
        <RemoteImageSelector
          primaryImage={primary}
          onSelect={onSelect}
          onUpload={() => setContent(UPLOAD)}
        />
      )}
      {content === UPLOAD && (
        <UploadIsoImage
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

export default ImageSelector;
