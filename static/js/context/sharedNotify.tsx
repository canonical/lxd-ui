import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
} from "react";
import { NotificationHelper } from "types/notification";

interface ContextProps {
  sharedNotify: NotificationHelper | null;
  setSharedNotify: ((newNotify: NotificationHelper) => void) | null;
}

const initialState: ContextProps = {
  sharedNotify: null,
  setSharedNotify: null,
};

const SharedNotifyContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const SharedNotifyProvider: FC<ProviderProps> = ({ children }) => {
  const [notify, setNotify] = useState<NotificationHelper | null>(null);

  const updateNotify = (newNotify: NotificationHelper) => {
    if (newNotify.id === notify?.id) {
      return;
    }
    setNotify(newNotify);
  };

  const value = {
    sharedNotify: notify,
    setSharedNotify: updateNotify,
  };

  return (
    <SharedNotifyContext.Provider value={value}>
      {children}
    </SharedNotifyContext.Provider>
  );
};

export function useSharedNotify() {
  return useContext(SharedNotifyContext);
}
