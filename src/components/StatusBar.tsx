import type { FC } from "react";
import classnames from "classnames";
import Version from "./Version";
import OperationStatus from "./OperationStatus";
import {
  AppStatus,
  ICONS,
  Icon,
  useToastNotification,
  useListener,
} from "@canonical/react-components";
import { iconLookup, severityOrder } from "util/notifications";
import { useAuth } from "context/auth";
import BearerTokenWarning from "components/BearerTokenWarning";
import { AUTH_METHOD } from "util/authentication";

interface Props {
  className?: string;
}

const StatusBar: FC<Props> = ({ className }) => {
  const { isAuthLoading, isAuthenticated, authMethod } = useAuth();
  const { toggleListView, notifications, countBySeverity, isListView } =
    useToastNotification();

  const closeOnEsc = (e: KeyboardEvent) => {
    // Close notifications list if Escape pressed
    if (e.code === "Escape" && isListView) {
      toggleListView();
    }
  };
  useListener(window, closeOnEsc, "keydown");

  const pointerEventType = (e: PointerEvent): string => {
    let isChip = false;
    let node = e.target as Element;
    // walk the dom upwards to identify if we have a click on a chip inside notification
    while (node?.parentNode) {
      node = node?.parentNode as Element;
      if (node?.classList?.contains("resource-link")) {
        isChip = true;
      }
      if (isChip && node?.classList?.contains("toast-notification-list")) {
        return "list-chip-click";
      }
      if (isChip && node?.classList?.contains("toast-notification")) {
        return "notification-chip-click";
      }
    }
    return "";
  };
  const closeOnChipClick = (e: PointerEvent) => {
    const eventType = pointerEventType(e);
    if (eventType === "list-chip-click") {
      // Close notification list if link in it is clicked
      toggleListView();
    }
    if (eventType === "notification-chip-click") {
      // Hide single notification if link in it is clicked
      // by opening and closing list
      toggleListView();
      toggleListView();
    }
  };
  useListener(window, closeOnChipClick, "click");

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  const notificationIcons = severityOrder.map((severity) => {
    if (countBySeverity[severity]) {
      return (
        <Icon
          key={severity}
          name={iconLookup[severity]}
          aria-label={`${severity} notification exists`}
        />
      );
    }
    return null;
  });

  const hasNotifications = !!notifications.length;
  const isBearerAuth = authMethod === AUTH_METHOD.BEARER;

  return (
    <>
      <AppStatus
        className={classnames("status-bar", className)}
        id="status-bar"
      >
        <Version />
        {isBearerAuth && <BearerTokenWarning />}
        <div className="status-right-container">
          <OperationStatus />
          {hasNotifications && (
            <button
              className={classnames(
                "u-no-margin u-no-padding u-no-border expand-button",
                { "button-active": isListView },
              )}
              onClick={toggleListView}
              aria-label="Expand notifications list"
            >
              {notificationIcons}
              <span className="total-count">{notifications.length}</span>
              <Icon name={isListView ? ICONS.chevronDown : ICONS.chevronUp} />
            </button>
          )}
        </div>
      </AppStatus>
    </>
  );
};

export default StatusBar;
