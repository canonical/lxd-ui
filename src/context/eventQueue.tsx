import { createContext, FC, ReactNode, useContext } from "react";

export interface EventQueue {
  get: (operationId: string) => EventCallback | undefined;
  set: (
    operationId: string,
    onSuccess: () => void,
    onFailure: (msg: string) => void,
    onFinish?: () => void,
  ) => void;
  remove: (operationId: string) => void;
}

const EventQueueContext = createContext<EventQueue>({
  get: () => undefined,
  set: () => undefined,
  remove: () => undefined,
});

interface Props {
  children: ReactNode;
}

interface EventCallback {
  onSuccess: () => void;
  onFailure: (msg: string) => void;
  onFinish?: () => void;
}

const eventQueue = new Map<string, EventCallback>();

export const EventQueueProvider: FC<Props> = ({ children }) => {
  return (
    <EventQueueContext.Provider
      value={{
        get: (operationId) => eventQueue.get(operationId),
        set: (operationId, onSuccess, onFailure, onFinish) => {
          eventQueue.set(operationId, { onSuccess, onFailure, onFinish });
        },
        remove: (operationId) => eventQueue.delete(operationId),
      }}
    >
      {children}
    </EventQueueContext.Provider>
  );
};

export function useEventQueue() {
  return useContext(EventQueueContext);
}
