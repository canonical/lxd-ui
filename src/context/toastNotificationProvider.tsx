import {
  NotificationAction,
  NotificationType,
  ValueOf,
  failure,
  info,
  success,
} from "@canonical/react-components";
import { NotificationSeverity } from "@canonical/react-components/dist/components/Notification/Notification";
import ToastNotification from "components/ToastNotification";
import ToastNotificationList from "components/ToastNotificationList";
import {
  FC,
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const HIDE_NOTIFICATION_DELAY = 5_000;

export type ToastNotificationType = NotificationType & {
  timestamp?: ReactNode;
  id: string;
};

type ToastNotificationHelper = {
  notifications: ToastNotificationType[];
  success: (message: ReactNode) => ToastNotificationType;
  info: (message: ReactNode, title?: string) => ToastNotificationType;
  failure: (
    title: string,
    error: unknown,
    message?: ReactNode,
    actions?: NotificationAction[],
  ) => ToastNotificationType;
  clear: (notification?: ToastNotificationType[]) => void;
  toggleListView: () => void;
  isListView: boolean;
  countBySeverity: GroupedNotificationCount;
};

export type GroupedNotificationCount = {
  [key in ValueOf<typeof NotificationSeverity>]?: number;
};

const initialNotification: ToastNotificationType = {
  id: "",
  message: "",
  type: "positive",
};
const ToastNotificationContext = createContext<ToastNotificationHelper>({
  notifications: [],
  success: () => initialNotification,
  info: () => initialNotification,
  failure: () => initialNotification,
  clear: () => null,
  toggleListView: () => null,
  isListView: false,
  countBySeverity: {},
});

const ToastNotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotificationType[]>(
    [],
  );
  const [showList, setShowList] = useState(false);
  const [notificationTimer, setNotificationTimer] =
    useState<NodeJS.Timeout | null>(null);

  // cleanup on timer if unmounted
  useEffect(() => {
    return () => {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }
    };
  }, []);

  const showNotificationWithDelay = () => {
    setNotificationTimer((prevTimer) => {
      if (prevTimer) {
        clearTimeout(prevTimer);
      }

      if (!showList) {
        return setTimeout(() => {
          setNotificationTimer(null);
        }, HIDE_NOTIFICATION_DELAY);
      }

      return null;
    });
  };

  const clearNotificationTimer = () => {
    setNotificationTimer((prevTimer) => {
      if (prevTimer) {
        clearTimeout(prevTimer);
      }
      return null;
    });
  };

  const addNotification = (
    notification: NotificationType & { error?: unknown },
  ) => {
    const notificationToAdd = {
      ...notification,
      timestamp: new Date().toLocaleString(),
      id: Date.now().toString() + (Math.random() + 1).toString(36).substring(7),
    };

    setNotifications((prev) => {
      return [...prev, notificationToAdd];
    });

    showNotificationWithDelay();

    return notificationToAdd;
  };

  const clear = (notifications?: ToastNotificationType[]) => {
    if (!notifications) {
      setNotifications([]);
      setShowList(false);
      clearNotificationTimer();
      return;
    }

    setNotifications((prev) => {
      const removeIdLookup = new Set(notifications);
      const newNotifications = prev.filter((item) => !removeIdLookup.has(item));

      // if we are clearing the last notification from an expanded list,
      // then we want to collapse the list as well if all notifications has been cleared
      if (!newNotifications.length) {
        setShowList(false);
      }

      return newNotifications;
    });

    clearNotificationTimer();
  };

  const toggleListView = () => {
    clearNotificationTimer();
    setShowList((prev) => !prev);
  };

  const countBySeverity = {
    positive: 0,
    negative: 0,
    caution: 0,
    information: 0,
  };
  notifications.forEach((notification) => {
    countBySeverity[notification.type] += 1;
  });
  const helper: ToastNotificationHelper = {
    notifications,
    failure: (title, error, message, actions) =>
      addNotification(failure(title, error, message, actions)),
    info: (message, title) => addNotification(info(message, title)),
    success: (message) => addNotification(success(message)),
    clear,
    toggleListView,
    isListView: showList,
    countBySeverity,
  };

  const latestNotification = notifications[notifications.length - 1];
  const hasNotifications = !!notifications.length;
  const showNotification = hasNotifications && !showList && notificationTimer;
  const showNotificationList = hasNotifications && showList;
  return (
    <ToastNotificationContext.Provider value={helper}>
      {children}
      <ToastNotification
        notification={latestNotification}
        onDismiss={clear}
        show={!!showNotification}
      />
      <ToastNotificationList
        notifications={notifications}
        groupedCount={countBySeverity}
        show={showNotificationList}
        onDismiss={clear}
      />
    </ToastNotificationContext.Provider>
  );
};

export default ToastNotificationProvider;

export const useToastNotification = () => useContext(ToastNotificationContext);
