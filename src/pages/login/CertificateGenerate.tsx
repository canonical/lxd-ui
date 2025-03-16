import type { FC } from "react";
import { Col, Row, Notification } from "@canonical/react-components";
import BrowserImport from "pages/login/BrowserImport";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import CustomLayout from "components/CustomLayout";

const CertificateGenerate: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <CustomLayout mainClassName="certificate-generate">
      <Row className="u-no-margin--left">
        <Col size={2} />
        <Col size={10}>
          <Notification
            actions={[
              {
                label: "I already have a client certificate",
                onClick: () => {
                  navigate("/ui/login/certificate-add");
                },
              },
            ]}
            title="Trust token"
            severity="information"
          >
            LXD uses mutual TLS for server client-server authentication. Your
            browser must have a client certificate installed and selected in
            order to proceed.
            <br /> If you already have a client certificate installed and
            selected, skip to the next step.
          </Notification>
          <BrowserImport />
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default CertificateGenerate;
