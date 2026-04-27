import type { FC } from "react";
import { List, Notification } from "@canonical/react-components";
import DocLink from "components/DocLink";

const SsoNotification: FC = () => {
  const PROVIDERS = [
    { name: "Auth0", docPath: "/howto/oidc_auth0/" },
    { name: "Ory Hydra", docPath: "/howto/oidc_ory/" },
    { name: "Keycloak", docPath: "/howto/oidc_keycloak/" },
    { name: "Entra ID", docPath: "/howto/oidc_entra_id/" },
    { name: "Pocket ID", docPath: "/howto/oidc_pocket_id/" },
  ];

  const getOidcProviderLink = (providerName: string, docPath: string) => {
    return <DocLink docPath={docPath}>{providerName}</DocLink>;
  };

  return (
    <Notification severity="information" className="oidc-notification">
      <p>
        LXD integrates with external identity providers using{" "}
        <b>OpenID Connect (OIDC)</b> to provide centralized login management.
      </p>
      <p>
        Choose an SSO provider to learn how to connect it to LXD:
        <List
          items={PROVIDERS.map((provider) =>
            getOidcProviderLink(provider.name, provider.docPath),
          )}
          middot
        />
        Your provider is not listed? Check our{" "}
        <DocLink docPath="/howto/oidc/">general OIDC documentation</DocLink>.
      </p>
    </Notification>
  );
};

export default SsoNotification;
