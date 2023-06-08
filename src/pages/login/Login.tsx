import React, { FC } from "react";
import { Button, Col, Icon, Row } from "@canonical/react-components";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import BaseLayout from "components/BaseLayout";
import { useSettings } from "context/useSettings";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <BaseLayout>
      <Row className="empty-state">
        <Col size={6} className="col-start-large-4">
          <Icon name="containers" className="empty-state-icon lxd-icon" />
          <h1 className="p-heading--4 u-sv-2">Login</h1>
          {hasOidc && (
            <>
              <p className="u-sv1">Choose your login method</p>
              <a className="p-button--positive" href="/oidc/login">
                Login with SSO
              </a>
              <h2 className="p-heading--5 u-sv-2">Other methods</h2>
              <div>
                Either{" "}
                <Link to="/ui/login/certificate-generate">
                  create a new certificate
                </Link>
              </div>
              <div>
                Or{" "}
                <Link to="/ui/login/certificate-add">
                  use an existing certificate
                </Link>{" "}
                already added to your browser
              </div>
            </>
          )}
          {!hasOidc && (
            <>
              <p className="u-sv1">Certificate selection</p>
              <Button
                appearance={"positive"}
                onClick={() => navigate("/ui/login/certificate-generate")}
              >
                Create a new certificate
              </Button>
              <p>
                Or{" "}
                <Link to="/ui/login/certificate-add">
                  use an existing certificate
                </Link>{" "}
                already added to your browser
              </p>
            </>
          )}
        </Col>
      </Row>
    </BaseLayout>
  );
};

export default Login;
