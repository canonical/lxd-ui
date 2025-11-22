import type { FC } from "react";
import { useState } from "react";
import { Notification } from "@canonical/react-components";
import DocLink from "components/DocLink";

const loadClosed = () => {
  const saved = localStorage.getItem("ssoNotificationClosed");
  return Boolean(saved);
};

const saveClosed = () => {
  localStorage.setItem("ssoNotificationClosed", "yes");
};

interface Props {
  hasOidc: boolean;
}

const SsoNotification: FC<Props> = ({ hasOidc }: Props) => {
  const [closed, setClosed] = useState(loadClosed());

  if (closed || hasOidc) {
    return null;
  }

  const handleClose = () => {
    saveClosed();
    setClosed(true);
  };

  return (
    <>
      <Notification
        severity="information"
        title="Did you know?"
        onDismiss={handleClose}
        actions={[
          <DocLink docPath="/howto/oidc/" key="sso-doc-link">
            Show me how
          </DocLink>,
        ]}
      >
        LXD can be configured to log in using a single sign-on provider.
      </Notification>
    </>
  );
};

export default SsoNotification;
