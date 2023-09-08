import React, { FC } from "react";
import { Modal } from "@canonical/react-components";
import { RemoteImage } from "types/image";
import RemoteImageSelector from "pages/images/RemoteImageSelector";
import UploadIsoImage from "pages/storage/UploadIsoImage";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage, type: string | null) => void;
}

const REMOTE_IMAGES = "remoteImages";
const UPLOAD = "upload";

const ImageSelector: FC<Props> = ({ onClose, onSelect }) => {
  const [content, setContent] = React.useState(REMOTE_IMAGES);
  return (
    <Modal
      close={onClose}
      title={
        content === REMOTE_IMAGES ? "Select base image" : "Upload custom ISO"
      }
      className={content === REMOTE_IMAGES ? "image-select-modal" : null}
    >
      {content === REMOTE_IMAGES && (
        <RemoteImageSelector
          onSelect={onSelect}
          onUpload={() => setContent(UPLOAD)}
        />
      )}
      {content === UPLOAD && (
        <UploadIsoImage
          onCancel={() => setContent(REMOTE_IMAGES)}
          onFinish={() => setContent(REMOTE_IMAGES)}
        />
      )}
    </Modal>
  );
};

export default ImageSelector;
