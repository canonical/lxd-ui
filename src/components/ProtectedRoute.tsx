import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { Spinner } from "@canonical/react-components";
import type { FC } from "react";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  outlet: React.JSX.Element;
}

const ProtectedRoute: FC<Props> = ({ outlet }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`${ROOT_PATH}/ui/login`} replace={true} />;
  }

  return outlet;
};

export default ProtectedRoute;
