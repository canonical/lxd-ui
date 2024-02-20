import { FC, useState } from "react";
import { Modal } from "@canonical/react-components";
import { LxdImageType, RemoteImage } from "types/image";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import CustomIsoSelector from "pages/images/CustomIsoSelector";
import { IsoImage } from "types/iso";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage, type: LxdImageType | null) => void;
}

const SELECT_ISO = "selectIso";
const UPLOAD_ISO = "uploadIso";

const CustomIsoModal: FC<Props> = ({ onClose, onSelect }) => {
  const [content, setContent] = useState(SELECT_ISO);
  const [primary, setPrimary] = useState<IsoImage | null>(null);

  const getTitle = () => {
    switch (content) {
      case SELECT_ISO:
        return "Select custom ISO";
      case UPLOAD_ISO:
        return "Upload custom ISO";
      default:
        return "";
    }
  };

  return (
    <Modal close={onClose} title={getTitle()} className="custom-iso-modal">
      {content === SELECT_ISO && (
        <CustomIsoSelector
          primaryImage={primary}
          onSelect={onSelect}
          onUpload={() => setContent(UPLOAD_ISO)}
          onCancel={onClose}
        />
      )}
      {content === UPLOAD_ISO && (
        <UploadCustomIso
          onCancel={() => setContent(SELECT_ISO)}
          onFinish={(name, pool) => {
            setContent(SELECT_ISO);
            setPrimary({ name, pool });
          }}
        />
      )}
    </Modal>
  );
};

export default CustomIsoModal;
