import { type FC } from "react";
import {
  Spinner,
  CustomLayout,
  Notification,
  Row,
} from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { isPermanent } from "util/authentication";
import { useSecondsLeft } from "context/useSecondsLeft";
import { getExpiryMessage } from "util/seconds";
import AuthenticationOptions from "components/AuthenticationOptions";
import { ROOT_PATH } from "util/rootPath";

const AuthenticationSetup: FC = () => {
  const { isAuthLoading, isAuthenticated, authMethod, authExpiresAt } =
    useAuth();
  const secondsLeft = useSecondsLeft(authExpiresAt);
  const expiryMessage = getExpiryMessage(secondsLeft);

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanent(authMethod)) {
    return (
      <Navigate to={`${ROOT_PATH}/ui/permissions/identities`} replace={true} />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`${ROOT_PATH}/ui/login`} replace={true} />;
  }

  return (
    <CustomLayout contentClassName="authentication-setup empty-state">
      <Row>
        <h1 className="p-heading--4 u-sv3">Set up permanent access</h1>
        {expiryMessage && (
          <Notification severity="caution">{expiryMessage}</Notification>
        )}
        <AuthenticationOptions />
      </Row>
    </CustomLayout>
  );
};

export default AuthenticationSetup;
