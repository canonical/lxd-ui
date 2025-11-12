import { type FC } from "react";
import { Icon, Spinner, CustomLayout } from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";
import DocLink from "components/DocLink";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <>
      <CustomLayout contentClassName="login">
        <div className="empty-state login-page">
          <Icon name="pods" className="lxd-icon" />
          <h1 className="p-heading--4 u-sv-2">Login</h1>

          <>
            <p className="u-sv1">Choose your login method</p>
            <div className="auth-container">
              {hasOidc && (
                <a className="p-button--positive has-icon" href="/oidc/login">
                  <Icon name="security" light />
                  <span>Login with SSO</span>
                </a>
              )}
              {!hasOidc && (
                <DocLink
                  className="p-button--positive has-icon"
                  docPath="/howto/oidc"
                >
                  <Icon name="security" light />
                  <span>Set up SSO login</span>
                </DocLink>
              )}
              <Link
                className="has-icon p-button"
                to="/ui/login/certificate-generate"
              >
                <Icon name="certificate" />
                <span>Set up TLS login</span>
              </Link>
            </div>
          </>
        </div>
      </CustomLayout>
    </>
  );
};

export default Login;
