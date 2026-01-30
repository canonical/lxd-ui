import { type FC } from "react";
import {
  Icon,
  Spinner,
  CustomLayout,
  Notification,
} from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import type { AuthMethod } from "util/authentication";
import { isPermanentAuthMethod } from "util/authentication";

const AuthenticationSetup: FC = () => {
  const { isAuthLoading, isAuthenticated, authMethod } = useAuth();
  const query = new URLSearchParams(window.location.search);
  const reason = query.get("reason");

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanentAuthMethod(authMethod as AuthMethod)) {
    return <Navigate to="/ui/permissions/identities" replace={true} />;
  }

  return (
    <CustomLayout contentClassName="authentication-setup u-flex-column">
      <Icon name="pods" className="lxd-icon" />
      <h1 className="p-heading--4 u-sv-1">Set up permanent access</h1>
      {reason === "expired" && (
        <Notification severity="caution" title="Your token has expired">
          To continue, you need to set up a permanent authentication method.
        </Notification>
      )}
      {reason === "invalid" && (
        <Notification severity="caution" title="Your token is invalid">
          To continue, you need to set up a permanent authentication method.
        </Notification>
      )}

      {!reason && (
        <p className="u-sv1">
          Your current bearer token session is temporary and will expire soon.
          Choose a permanent method below.
        </p>
      )}
      <p className="u-sv1 text-align--left">
        <b>SSO (Single Sign-On):</b> Recommended for production environments.
        Connect LXD to your existing identity provider (OIDC) like Auth0, Ory
        Hydra,Keycloak, or Entra ID to manage user access centrally. <br />
        <br />
        <b>TLS (Transport Layer Security):</b> Recommended for local development
        or quick setups. Authenticate by generating and importing a client
        certificate into your browser. No external server required.
      </p>
      <div className="auth-container">
        {/* Cannot use DocLink here because of circular dependency with useDocs and useSupportedFeatures*/}
        <a
          className="p-button--positive has-icon"
          href="https://documentation.ubuntu.com/lxd/en/latest/howto/oidc"
          target="_blank"
          rel="noopener noreferrer"
          title="Set up SSO login"
        >
          <Icon name="security" light />
          <span>Set up SSO login</span>
        </a>
        <Link className="has-icon p-button" to="/ui/login/certificate-generate">
          <Icon name="certificate" />
          <span>Set up TLS login</span>
        </Link>
      </div>
    </CustomLayout>
  );
};

export default AuthenticationSetup;
