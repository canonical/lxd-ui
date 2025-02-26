import { createContext, FC, ReactNode, useContext } from "react";
import type { LxdEvent } from "types/event";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

export interface EventQueue {
  get: (operationId: string) => EventCallback | undefined;
  set: (
    operationId: string,
    onSuccess: (event: LxdEvent) => void,
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
  onSuccess: (event: LxdEvent) => void;
  onFailure: (msg: string) => void;
  onFinish?: () => void;
}

const eventQueue = new Map<string, EventCallback>();

export const EventQueueProvider: FC<Props> = ({ children }) => {
  const queryClient = useQueryClient();

  return (
    <EventQueueContext.Provider
      value={{
        get: (operationId) => eventQueue.get(operationId),
        set: (operationId, onSuccess, onFailure, onFinish) => {
          eventQueue.set(operationId, { onSuccess, onFailure, onFinish });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.operations],
          });
        },
        remove: (operationId) => {
          eventQueue.delete(operationId);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.operations],
          });
        },
      }}
    >
      {children}
    </EventQueueContext.Provider>
  );
};

export function useEventQueue() {
  return useContext(EventQueueContext);
}
