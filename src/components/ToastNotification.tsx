import { Notification } from "@canonical/react-components";
import { DefaultTitles } from "@canonical/react-components/dist/components/Notification/Notification";
import { ToastNotificationType } from "context/toastNotificationProvider";
import { FC } from "react";
import { createPortal } from "react-dom";
import Animate from "./Animate";

interface Props {
  notification: ToastNotificationType;
  onDismiss: (notification?: ToastNotificationType[]) => void;
  show: boolean;
}

const ToastNotification: FC<Props> = ({ notification, onDismiss, show }) => {
  if (!notification) {
    return;
  }

  return (
    <>
      {createPortal(
        <Animate
          show={show}
          from={{
            opacity: 0,
          }}
          to={{
            opacity: 1,
          }}
          exitAnimation={[
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(50px)" },
          ]}
          options={{ duration: 200 }}
          className="toast-animate"
        >
          <div className="toast-notification">
            <Notification
              title={notification.title ?? DefaultTitles[notification.type]}
              actions={notification.actions}
              severity={notification.type}
              onDismiss={() => onDismiss([notification])}
              className="u-no-margin--bottom"
              timestamp={notification.timestamp}
              titleElement="div"
              role="alert"
            >
              {notification.message}
            </Notification>
          </div>
        </Animate>,
        document.body,
      )}
    </>
  );
};

export default ToastNotification;
