import type { FC, KeyboardEvent } from "react";
import { Modal } from "@canonical/react-components";
import OidcConfigurationForm from "pages/permissions/OidcConfigurationForm";

interface Props {
  close: () => void;
}

const OidcConfigurationModal: FC<Props> = ({ close }) => {
  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  return (
    <Modal
      close={close}
      className="edit-oidc-config settings"
      title="Single sign-on configuration"
      onKeyDown={handleEscKey}
    >
      <OidcConfigurationForm closeModal={close} />
    </Modal>
  );
};

export default OidcConfigurationModal;
