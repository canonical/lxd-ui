import { type FC } from "react";
import { Icon, Spinner, CustomLayout } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { useAuth } from "context/auth";
import DocLink from "components/DocLink";

const AuthenticationSetup: FC = () => {
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <>
      <CustomLayout contentClassName="authentication-setup u-flex-column">
        <Icon name="pods" className="lxd-icon" />
        <h1 className="p-heading--4 u-sv-2">Upgrade to permanent access</h1>

        <>
          <p className="u-sv1">
            Your current bearer token session is temporary and will expire soon.
            Choose a permanent method below.
          </p>
          <div className="auth-container">
            <DocLink
              className="p-button--positive has-icon"
              docPath="/howto/oidc"
            >
              <Icon name="security" light />
              <span>Set up SSO login</span>
            </DocLink>
            <Link
              className="has-icon p-button"
              to="/ui/login/certificate-generate"
            >
              <Icon name="certificate" />
              <span>Set up TLS login</span>
            </Link>
          </div>
        </>
      </CustomLayout>
    </>
  );
};

export default AuthenticationSetup;
