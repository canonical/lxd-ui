import type { FC } from "react";
import { useAuth } from "context/auth";
import { AUTH_METHOD, isPermanent } from "util/authentication";
import CreateTlsIdentityWithBearerToken from "./CreateTlsIdentityWithBearerToken";
import CertificateAddToken from "./CertificateAddToken";
import { Spinner } from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

const CertificateAdd: FC = () => {
  const { isAuthenticated, isAuthLoading, authMethod } = useAuth();
  const isBearerToken = authMethod === AUTH_METHOD.BEARER;

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanent(authMethod)) {
    return <Navigate to={`${ROOT_PATH}/ui`} replace={true} />;
  }

  if (isAuthenticated && isBearerToken) {
    return <CreateTlsIdentityWithBearerToken />;
  }

  return <CertificateAddToken />;
};

export default CertificateAdd;
