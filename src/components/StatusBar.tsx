import React, { FC } from "react";
import classnames from "classnames";
import Version from "./Version";
import OperationStatus from "./OperationStatus";
import { useToastNotification } from "context/toastNotificationProvider";
import { ICONS, Icon } from "@canonical/react-components";
import { iconLookup, severityOrder } from "util/notifications";
import useEventListener from "@use-it/event-listener";

interface Props {
  className?: string;
}

const StatusBar: FC<Props> = ({ className }) => {
  const { toggleListView, notifications, countBySeverity, isListView } =
    useToastNotification();

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close notifications list if Escape pressed
    if (e.code === "Escape" && isListView) {
      toggleListView();
    }
  });

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
  });

  const hasNotifications = !!notifications.length;
  return (
    <>
      <aside
        className={classnames("l-status status-bar", className)}
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
      </aside>
    </>
  );
};

export default StatusBar;
