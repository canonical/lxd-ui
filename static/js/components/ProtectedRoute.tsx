import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "./Loader";

interface Props {
  outlet: JSX.Element;
}

const ProtectedRoute = ({ outlet }: Props) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/ui/certificates" replace={true} />;
  }

  return outlet;
};

export default ProtectedRoute;
