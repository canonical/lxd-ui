import type { FC } from "react";
import { Col, Row, Notification } from "@canonical/react-components";
import BrowserImport from "pages/login/BrowserImport";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import CustomLayout from "components/CustomLayout";
import { useSettings } from "context/useSettings";

const CertificateGenerate: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const hasCertificate = settings?.client_certificate;

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <CustomLayout mainClassName="certificates">
      <Row>
        <Col size={1} />
        <Col size={10}>
          <Notification
            actions={
              hasCertificate
                ? []
                : [
                    {
                      label: "I already have a client certificate",
                      onClick: () => {
                        navigate("/ui/login/certificate-add");
                      },
                    },
                  ]
            }
            title="TLS login"
            severity="information"
          >
            LXD uses mutual TLS for server client-server authentication. Your
            browser must have a client certificate installed and selected in
            order to proceed.
          </Notification>
          {hasCertificate && (
            <Notification
              actions={[
                {
                  label: "Skip to step 2",
                  onClick: () => {
                    navigate("/ui/login/certificate-add");
                  },
                },
              ]}
              title="Client certificate already present"
              severity="positive"
            >
              It looks like you you already have a client certificate installed
              and selected, skip to the next step.
            </Notification>
          )}
          <BrowserImport />
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default CertificateGenerate;
