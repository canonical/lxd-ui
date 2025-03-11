import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import { useSettings } from "context/useSettings";
import CustomLayout from "components/CustomLayout";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  if (!hasOidc) {
    return <Navigate to="/ui/login/certificate-generate" replace={true} />;
  }

  return (
    <CustomLayout contentClassName="login">
      <div className="empty-state login-page">
        <Icon name="pods" className="login-ui-icon lxd-icon" />
        <h1 className="p-heading--4 u-sv-2">Login</h1>
        {hasOidc && (
          <>
            <p className="u-sv1">Choose your login method</p>
            <div className="auth-container">
              <a className="p-button--positive has-icon" href="/oidc/login">
                <Icon name="security" light />
                <span>Login with SSO</span>
              </a>
              <a
                className="p-button has-icon"
                href="/ui/login/certificate-generate"
              >
                <Icon name="certificate" className="auth-button-icon" />
                <span>Login with TLS</span>
              </a>
            </div>
          </>
        )}
      </div>
    </CustomLayout>
  );
};

export default Login;
