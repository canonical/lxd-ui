import { type FC } from "react";
import { Icon, Spinner, CustomLayout } from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { ROOT_PATH } from "util/rootPath";
import AuthenticationOptions from "components/AuthenticationOptions";
import { useSettings } from "context/useSettings";
import { AUTH_METHOD } from "util/authentication";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes(AUTH_METHOD.OIDC);

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated) {
    return <Navigate to={`${ROOT_PATH}/ui`} replace={true} />;
  }

  return (
    <>
      <CustomLayout contentClassName="login">
        <div className="empty-state login-page">
          {hasOidc && (
            <>
              <div className="u-sv2">
                <Icon name="cluster-host" className="lxd-icon" />
              </div>
              <div className="auth-container">
                <a
                  className="p-button--positive has-icon"
                  href={`${ROOT_PATH}/oidc/login`}
                >
                  <Icon name="security" light />
                  <span>Login with SSO</span>
                </a>
                <Link to={`${ROOT_PATH}/ui/login/certificate-generate`}>
                  <span>Set up TLS login</span>
                </Link>
              </div>
            </>
          )}
          {!hasOidc && (
            <>
              <Icon name="cluster-host" className="lxd-icon" />
              <h1 className="p-heading--4 u-sv1">Choose your login method</h1>
              <AuthenticationOptions />
            </>
          )}
        </div>
      </CustomLayout>
    </>
  );
};

export default Login;
