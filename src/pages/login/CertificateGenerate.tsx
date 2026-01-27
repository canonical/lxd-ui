import type { FC } from "react";
import {
  Col,
  Notification,
  Row,
  Spinner,
  CustomLayout,
  Icon,
} from "@canonical/react-components";
import BrowserImport from "pages/login/BrowserImport";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";
import { ROOT_PATH } from "util/rootPath";
import { AUTH_METHOD, isPermanent } from "util/authentication";
import AuthenticationTlsStepper from "components/AuthenticationTlsStepper";
import classnames from "classnames";

const CertificateGenerate: FC = () => {
  const { isAuthenticated, isAuthLoading, authMethod } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const hasCertificate = settings?.client_certificate;
  const isBearerToken = authMethod === AUTH_METHOD.BEARER;

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanent(authMethod)) {
    return <Navigate to={`${ROOT_PATH}/ui`} replace={true} />;
  }

  return (
    <CustomLayout
      mainClassName={classnames("certificates", {
        "certificates-with-bearer-token": isBearerToken,
      })}
    >
      <Row>
        {isBearerToken && (
          <AuthenticationTlsStepper
            variant="horizontal"
            step2Name="Create TLS identity"
          />
        )}
        {!isBearerToken && <Col size={1} />}
        <Col size={isBearerToken ? 12 : 10}>
          <Notification
            actions={
              hasCertificate
                ? []
                : [
                    {
                      label: "I already have a client certificate",
                      onClick: () => {
                        navigate(`${ROOT_PATH}/ui/login/certificate-add`);
                      },
                    },
                  ]
            }
            title="TLS login"
            severity="information"
          >
            LXD uses mutual TLS for server client-server authentication. Your
            browser must have a client certificate installed and selected in
            order to proceed.{" "}
            <a
              href="https://github.com/canonical/lxd-ui/wiki/Authentication-Setup-FAQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Authentication Setup FAQ
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </Notification>
          {hasCertificate && (
            <Notification
              actions={[
                {
                  label: `Skip to step 2: ${isBearerToken ? "Create TLS identity" : "Identity trust token"}`,
                  onClick: () => {
                    navigate(`${ROOT_PATH}/ui/login/certificate-add`);
                  },
                },
              ]}
              title="Client certificate already present"
              severity="positive"
            >
              It looks like you already have a client certificate installed and
              selected, skip to the next step.
            </Notification>
          )}
          <BrowserImport />
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default CertificateGenerate;
