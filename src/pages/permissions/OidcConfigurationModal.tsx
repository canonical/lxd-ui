import type { FC } from "react";
import { Modal, useNotify } from "@canonical/react-components";
import OidcConfigurationForm from "pages/permissions/OidcConfigurationForm";

interface Props {
  close: () => void;
}

const OidcConfigurationModal: FC<Props> = ({ close }) => {
  const notify = useNotify();

  const onClose = () => {
    notify.clear();
    close();
  };

  return (
    <Modal
      close={onClose}
      className="edit-oidc-config settings"
      title="Single sign-on configuration"
    >
      <OidcConfigurationForm closeModal={onClose} />
    </Modal>
  );
};

export default OidcConfigurationModal;
