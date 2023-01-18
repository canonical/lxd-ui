import React, {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { NotificationHelper } from "types/notification";

interface ContextProps {
  sharedNotify: NotificationHelper | null;
  setSharedNotify: Dispatch<SetStateAction<NotificationHelper | null>> | null;
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

  const value = {
    sharedNotify: notify,
    setSharedNotify: setNotify,
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
