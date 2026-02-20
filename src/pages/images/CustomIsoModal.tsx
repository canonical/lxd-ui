import type { FC } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import type { LxdImageType, RemoteImage } from "types/image";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import CustomIsoSelector from "pages/images/CustomIsoSelector";
import type { IsoImage } from "types/iso";
import BackLink from "components/BackLink";

interface Props {
  onClose: () => void;
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
  onCancel?: () => void;
  cancelButtonText?: string;
  backLinkText?: string;
}

const SELECT_ISO = "selectIso";
const UPLOAD_ISO = "uploadIso";

const CustomIsoModal: FC<Props> = ({
  onClose,
  onSelect,
  onCancel,
  cancelButtonText,
  backLinkText,
}) => {
  const [content, setContent] = useState(SELECT_ISO);
  const [primary, setPrimary] = useState<IsoImage | null>(null);
  const SELECT_CUSTOM_ISO_TITLE = "Select custom ISO";

  const getTitle = () => {
    switch (content) {
      case SELECT_ISO:
        return backLinkText ? (
          <BackLink
            title={SELECT_CUSTOM_ISO_TITLE}
            onClick={onCancel ?? onClose}
            linkText={backLinkText}
          />
        ) : (
          SELECT_CUSTOM_ISO_TITLE
        );
      case UPLOAD_ISO:
        return (
          <BackLink
            title="Upload custom ISO"
            onClick={() => {
              setContent(SELECT_ISO);
            }}
            linkText={SELECT_CUSTOM_ISO_TITLE}
          />
        );
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
          onUpload={() => {
            setContent(UPLOAD_ISO);
          }}
          onCancel={onCancel ?? onClose}
          cancelButtonText={cancelButtonText}
        />
      )}
      {content === UPLOAD_ISO && (
        <UploadCustomIso
          onCancel={() => {
            setContent(SELECT_ISO);
          }}
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
