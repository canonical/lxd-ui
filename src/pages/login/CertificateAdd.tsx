import type { FC } from "react";
import {
  CodeSnippet,
  Col,
  Notification,
  Row,
  useNotify,
} from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import CertificateAddForm from "pages/login/CertificateAddForm";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";

const CertificateAdd: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const notify = useNotify();

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
          {notify.notification ? (
            <NotificationRow />
          ) : (
            <Row>
              <Notification title="Trust token" severity="information">
                In order for your browser certificate to be added to the
                server’s trust store, you must present a trust token generated
                by the server.
              </Notification>
            </Row>
          )}
          <div className="p-stepped-list__content">
            <div>
              Run the following commands on the LXD server to create a new
              identity and generate a trust token:
            </div>
            <CodeSnippet
              blocks={[
                {
                  code: `# Create a group called admin. \n# You can replace admin with the name you want to give to the group. \nlxc auth group create admin`,
                  wrapLines: true,
                },
                {
                  code: `# Assign admin permissions to the admin group.\nlxc auth group permission add admin server admin`,
                  wrapLines: true,
                },
                {
                  code: `# Create the new user with the admin group. \n# You can replace lxd-ui with the name you want to give to the identity. \nlxc auth identity create tls/lxd-ui --group admin`,
                  wrapLines: true,
                },
              ]}
            />
          </div>

          <div className="p-stepped-list__content">
            <CertificateAddForm />
          </div>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default CertificateAdd;
