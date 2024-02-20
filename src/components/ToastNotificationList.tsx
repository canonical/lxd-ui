import { Icon, Notification, ValueOf } from "@canonical/react-components";
import {
  DefaultTitles,
  NotificationSeverity,
} from "@canonical/react-components/dist/components/Notification/Notification";
import {
  GroupedNotificationCount,
  ToastNotificationType,
} from "context/toastNotificationProvider";
import { FC, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { iconLookup, severityOrder } from "util/notifications";
import Animate from "./Animate";
import { usePrefersReducedMotion } from "util/usePreferReducedMotion";

export type FilterTypes = ValueOf<typeof NotificationSeverity>;

interface Props {
  notifications: ToastNotificationType[];
  onDismiss: (notification?: ToastNotificationType[]) => void;
  groupedCount: GroupedNotificationCount;
  show: boolean;
}

const ToastNotificationList: FC<Props> = ({
  notifications,
  onDismiss,
  groupedCount = {},
  show,
}) => {
  const [filters, setFilters] = useState<Set<FilterTypes>>(new Set());
  const prevNotificationsSize = useRef<number>(notifications.length);
  const containerRef = useRef<HTMLUListElement>(null);
  const hasFilters = !!filters.size;
  const preferReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    adjustScrollPosition();
  }, [notifications]);

  // this layout effect is used to maintain scroll position of the
  // notification list when new notifications are added to the list
  // for only when the scroll is at the top
  const adjustScrollPosition = () => {
    const notificationsRemoved =
      notifications.length < prevNotificationsSize.current;
    prevNotificationsSize.current = notifications.length;
    if (!notifications.length || notificationsRemoved) {
      return;
    }

    const container = containerRef.current;
    const lastNotification = notifications[notifications.length - 1];
    const notificationEl = document.getElementById(lastNotification.id);
    if (container && notificationEl) {
      const currentScrollY = container.scrollTop;
      const offsetHeight =
        notificationEl.getBoundingClientRect().height +
        parseFloat(window.getComputedStyle(notificationEl).marginTop) +
        parseFloat(window.getComputedStyle(notificationEl).marginBottom);
      // only adjust the scroll height if the scroll is at the top
      if (currentScrollY === 0) {
        container.scrollTop = currentScrollY + offsetHeight;
      }
    }
  };

  const handleFilterSelect = (filter: FilterTypes) => {
    setFilters((prevFilters) => {
      const newFilters = new Set(prevFilters);
      if (!newFilters.has(filter)) {
        newFilters.add(filter);
      } else {
        newFilters.delete(filter);
      }
      return newFilters;
    });
  };

  const handleGroupedDismiss = () => {
    if (hasFilters) {
      const notificationsToClear = notifications.filter((notification) =>
        filters.has(notification.type),
      );
      onDismiss(notificationsToClear);
      setFilters(new Set());
      return;
    }

    onDismiss();
  };

  const getSeverityFilters = () => {
    const filterButtons = severityOrder.map((severity) => {
      if (groupedCount[severity]) {
        return (
          <button
            aria-label={`Filter ${severity} notifications`}
            aria-pressed={filters.has(severity)}
            key={severity}
            className="u-no-margin u-no-border filter-button"
            onClick={() => handleFilterSelect(severity)}
          >
            <Icon name={iconLookup[severity]} />
            <span>{groupedCount[severity]}</span>
          </button>
        );
      }
      return null;
    });

    return (
      <div className="filters">
        {filterButtons}
        {hasFilters && (
          <button
            className="u-no-margin--bottom u-no-border"
            onClick={() => setFilters(new Set())}
          >
            Clear filters
          </button>
        )}
      </div>
    );
  };

  const getDismissText = () => {
    if (hasFilters) {
      const validFilters = Object.keys(groupedCount) as FilterTypes[];
      let totalCount = 0;
      for (const filter of validFilters) {
        if (filters.has(filter)) {
          totalCount += groupedCount[filter] || 0;
        }
      }

      const dismissText = (
        <span className="dismiss-text">Dismiss {totalCount}</span>
      );
      return dismissText;
    }

    return <span>Dismiss all</span>;
  };

  const handleDismissNotification = (notification: ToastNotificationType) => {
    if (preferReducedMotion) {
      onDismiss([notification]);
      return;
    }

    // animate the notification dismissal before updating states to delay unmounting
    const element = document.getElementById(`li-${notification.id}`);
    if (element) {
      element.style.transformOrigin = "center";
      element.style.overflow = "hidden";
      const animation = element.animate(
        [
          { height: `${element.scrollHeight}px`, opacity: 1 },
          { height: "0px", opacity: 0 },
        ],
        {
          duration: 200,
          easing: "linear",
          fill: "forwards",
        },
      );

      animation.onfinish = () => {
        element.style.display = "none";
        onDismiss([notification]);
      };
    }
  };

  // Only filter input data if there are filters present
  const filteredNotifications = hasFilters
    ? notifications.filter((notification) => filters.has(notification.type))
    : notifications;

  // Don't assign alert role for notifications when expanded since we don't want
  // screen readers to announce every existing notification
  const notificationEls = filteredNotifications.map((_, index, array) => {
    const lastNotificationIndex = array.length - 1;
    // This will map notifications in reverse order
    const notification = array[lastNotificationIndex - index];
    return (
      <li key={notification.id} id={`li-${notification.id}`}>
        <Notification
          id={notification.id}
          title={notification.title ?? DefaultTitles[notification.type]}
          actions={notification.actions}
          severity={notification.type}
          onDismiss={() => handleDismissNotification(notification)}
          className={`u-no-margin--bottom individual-notification`}
          timestamp={notification.timestamp}
          titleElement="div"
        >
          {notification.message}
        </Notification>
      </li>
    );
  });

  return createPortal(
    <Animate
      show={show}
      from={{
        opacity: 0,
        transform: "translateY(5vh)",
      }}
      to={{
        opacity: 1,
        transform: "translateY(0)",
      }}
      options={{ duration: 100 }}
      className="toast-animate"
    >
      <ul
        className="toast-notification-list"
        aria-label="Notifications list"
        ref={containerRef}
      >
        {notificationEls}
        <div className="dismiss">
          {getSeverityFilters()}
          <button
            className="u-no-margin--bottom dismiss-button"
            onClick={handleGroupedDismiss}
          >
            {getDismissText()}
          </button>
        </div>
      </ul>
    </Animate>,
    document.body,
  );
};

export default ToastNotificationList;
