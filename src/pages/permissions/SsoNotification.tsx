import type { FC } from "react";
import { useState } from "react";
import { Notification } from "@canonical/react-components";
import SsoProviderSelector from "components/SsoProviderSelector/SsoProviderSelector";

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
  const [isModal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

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
          {
            label: "Show me how",
            onClick: () => {
              openModal();
            },
          },
        ]}
      >
        LXD can be configured to log in using a single sign-on provider.
      </Notification>

      {isModal && <SsoProviderSelector closeModal={closeModal} />}
    </>
  );
};

export default SsoNotification;
