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

interface Props {
  className?: string;
}

const StatusBar: FC<Props> = ({ className }) => {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const { toggleListView, notifications, countBySeverity, isListView } =
    useToastNotification();

  useListener(
    window,
    (e: KeyboardEvent) => {
      // Close notifications list if Escape pressed
      if (e.code === "Escape" && isListView) {
        toggleListView();
      }
    },
    "keydown",
  );

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
  return (
    <>
      <AppStatus
        className={classnames("status-bar", className)}
        id="status-bar"
      >
        <Version />
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
