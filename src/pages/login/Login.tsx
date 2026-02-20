import { type FC } from "react";
import { Icon, Spinner, CustomLayout } from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { ROOT_PATH } from "util/rootPath";
import AuthenticationOptions from "components/AuthenticationOptions";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

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
          <Icon name="cluster-host" className="lxd-icon" />
          <h1 className="p-heading--4 u-sv1">Choose your login method</h1>
          <AuthenticationOptions />
        </div>
      </CustomLayout>
    </>
  );
};

export default Login;
