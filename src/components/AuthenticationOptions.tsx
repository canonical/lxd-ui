import type { FC } from "react";
import { Icon, Card } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import { AUTH_METHOD } from "util/authentication";
import { useSettings } from "context/useSettings";
import DocLink from "components/DocLink";

const AuthenticationOptions: FC = () => {
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes(AUTH_METHOD.OIDC);

  return (
    <div className="auth-options-container">
      <Card className="auth-option-card u-flex-column">
        <Icon name="security" className="auth-option-icon u-hide--small" />
        <h2 className="p-heading--4">SSO</h2>
        <ul className="auth-option-pros-cons-list">
          <li>Centralized access control for teams</li>
          <li>Requires an external identity provider</li>
        </ul>

        {hasOidc && (
          <a
            className="p-button--positive auth-option-link"
            href={`${ROOT_PATH}/oidc/login`}
          >
            Login with SSO
          </a>
        )}
        {!hasOidc && (
          <DocLink
            docPath="/howto/oidc"
            className="p-button--positive auth-option-link"
          >
            Set up SSO login
          </DocLink>
        )}
      </Card>

      <Card className="auth-option-card u-flex-column">
        <Icon name="certificate" className="auth-option-icon u-hide--small" />
        <h2 className="p-heading--4">TLS</h2>

        <ul className="auth-option-pros-cons-list">
          <li>Quick setup with a browser certificate</li>
          <li>No external identity provider required</li>
        </ul>
        <Link
          className="p-button auth-option-link"
          to={`${ROOT_PATH}/ui/login/certificate-generate`}
        >
          Set up TLS login
        </Link>
      </Card>
    </div>
  );
};

export default AuthenticationOptions;
