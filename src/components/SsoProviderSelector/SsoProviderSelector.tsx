import type { FC } from "react";
import SsoProviderButton from "./SsoProviderButton";
import { useDocs } from "context/useDocs";
import { Modal } from "@canonical/react-components";

interface Props {
  closeModal: () => void;
}

const SsoProviderSelector: FC<Props> = ({ closeModal }: Props) => {
  const docBaseLink = useDocs();

  return (
    <Modal
      close={closeModal}
      title="Choose Single Sign-On provider"
      className="choose-sso-provider-modal"
    >
      <p>
        Single Sign-On allows you to log into LXD using an external identity,
        like Google or Microsoft. We have integrations with several{" "}
        <abbr title="Single Sign-On">SSO</abbr> providers. Choose which one you
        would like to use to learn more:
      </p>
      <div className="sso-provider-buttons-container">
        <SsoProviderButton
          providerName="Entra ID"
          to={`${docBaseLink}/howto/oidc_entra_id/#`}
        />
        <SsoProviderButton
          providerName="Keycloak"
          to={`${docBaseLink}/howto/oidc_keycloak/`}
        />
        <SsoProviderButton
          providerName="Ory Hydra"
          to={`${docBaseLink}/howto/oidc_ory/`}
        />
        <SsoProviderButton
          providerName="Auth0"
          to={`${docBaseLink}/howto/oidc_auth0/`}
        />
      </div>
    </Modal>
  );
};

export default SsoProviderSelector;
