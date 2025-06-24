import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import { useSettings } from "context/useSettings";
import CustomLayout from "components/CustomLayout";
import classnames from "classnames";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");

  if (isAuthLoading) {
    return <Loader isMainComponent />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
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
            <Link
              className={classnames(" has-icon", {
                "p-button--positive": !hasOidc,
                "p-button": hasOidc,
              })}
              to="/ui/login/certificate-generate"
            >
              <Icon
                name="certificate"
                className={classnames("auth-button-icon", {
                  "is-light": !hasOidc,
                })}
              />
              <span>Login with TLS</span>
            </Link>
          </div>
        </>
      </div>
    </CustomLayout>
  );
};

export default Login;
