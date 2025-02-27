import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "./Loader";
import type { FC } from "react";

interface Props {
  outlet: React.JSX.Element;
}

const ProtectedRoute: FC<Props> = ({ outlet }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/ui/login" replace={true} />;
  }

  return outlet;
};

export default ProtectedRoute;
