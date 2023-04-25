import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import BaseLayout from "components/BaseLayout";
import EmptyState from "components/EmptyState";

const CertificateMain: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <BaseLayout title="">
      <EmptyState
        iconName="containers"
        iconClass="lxd-icon"
        title="LXD UI"
        message="To access the user interface, create a certificate."
      >
        <Button
          appearance="positive"
          onClick={() => navigate("/ui/certificates/generate")}
        >
          Setup
        </Button>
      </EmptyState>
    </BaseLayout>
  );
};

export default CertificateMain;
