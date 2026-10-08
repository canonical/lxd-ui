import type { FC } from "react";
import {
  Accordion,
  CodeSnippet,
  Col,
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { InlineCode } from "@canonical/react-ds-global";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import CertificateAddForm from "pages/login/CertificateAddForm";
import NotificationRow from "components/NotificationRow";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";
import { ROOT_PATH } from "util/rootPath";
import { isPermanent } from "util/authentication";
import CertificateAddNotifications from "components/CertificateAddNotifications";

const CertificateAddToken: FC = () => {
  const { isAuthenticated, isAuthLoading, authMethod } = useAuth();
  const notify = useNotify();
  const identityTrustTokenCommand =
    "if ! lxc auth group show admins >/dev/null 2>&1; then lxc auth group create admins && lxc auth group permission add admins server admin; fi; lxc auth identity create tls/lxd-ui --group admins";

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanent(authMethod)) {
    return <Navigate to={`${ROOT_PATH}/ui`} replace={true} />;
  }

  return (
    <CustomLayout mainClassName="certificate-generate">
      <Row>
        <Col size={2} />
        <Col size={8}>
          {notify.notification ? (
            <NotificationRow />
          ) : (
            <Row>
              <CertificateAddNotifications />
            </Row>
          )}
          <div className="p-stepped-list__content">
            <p>
              Paste the following commands into the console of the machine where
              LXD is running:
            </p>

            <CodeSnippetWithCopyButton code={identityTrustTokenCommand} />
            <Accordion
              sections={[
                {
                  title: <>What does this command do?</>,
                  content: (
                    <>
                      <p>
                        The above command is a one-line equivalent for the
                        following steps:
                      </p>
                      <div>
                        First, the command checks to see if there is an auth
                        group <InlineCode>admins</InlineCode>. The{" "}
                        <InlineCode>{`>/dev/null 2>&1`}</InlineCode> part
                        ensures that if the group is missing, no error is shown.
                      </div>
                      <CodeSnippet
                        blocks={[
                          {
                            code: `if ! lxc auth group show admins >/dev/null 2>&1;`,
                            wrapLines: true,
                          },
                        ]}
                      />
                      <div>
                        If there is no group <InlineCode>admins</InlineCode>, it
                        is created.
                      </div>
                      <CodeSnippet
                        blocks={[
                          {
                            code: `lxc auth group create admins`,
                            wrapLines: true,
                          },
                        ]}
                      />
                      <div>
                        The new group <InlineCode>admins</InlineCode> is given
                        server admin permissions.
                      </div>
                      <CodeSnippet
                        blocks={[
                          {
                            code: `lxc auth group permission add admins server admin`,
                            wrapLines: true,
                          },
                        ]}
                      />
                      <div>
                        Finally, a new identity <InlineCode>lxd-ui</InlineCode>{" "}
                        is created and added to the group{" "}
                        <InlineCode>admins</InlineCode>. This command returns
                        the identity trust token which should be pasted below.
                      </div>
                      <CodeSnippet
                        blocks={[
                          {
                            code: `lxc auth identity create tls/lxd-ui --group admins`,
                            wrapLines: true,
                          },
                        ]}
                      />
                    </>
                  ),
                },
              ]}
            />
            <Accordion
              sections={[
                {
                  title: <>I already have an identity trust token</>,
                  content: (
                    <>
                      <p>
                        If you received an identity trust token or created a TLS
                        identity, use it below. No extra steps needed.
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </div>
          <div className="p-stepped-list__content">
            <br />
            <CertificateAddForm />
          </div>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default CertificateAddToken;
