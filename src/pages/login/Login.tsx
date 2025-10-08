import { useState, type FC } from "react";
import {
  Icon,
  Spinner,
  CustomLayout,
  Button,
} from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";
import SsoProviderSelector from "components/SsoProviderSelector/SsoProviderSelector";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const [isModal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

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
                <Button hasIcon onClick={openModal} appearance="positive">
                  <Icon name="security" light />
                  <span>Set up SSO login</span>
                </Button>
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
      {isModal && <SsoProviderSelector closeModal={closeModal} />}
    </>
  );
};

export default Login;
