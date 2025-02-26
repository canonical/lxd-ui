import type { FC } from "react";
import { useEffect, useState } from "react";
import type { LxdEvent } from "types/event";
import { useEventQueue } from "context/eventQueue";
import { useAuth } from "context/auth";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useOperations } from "context/operationsProvider";

const Events: FC = () => {
  const { isAuthenticated } = useAuth();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const [eventWs, setEventWs] = useState<WebSocket | null>(null);
  const { refetchOperations } = useOperations();

  const handleEvent = (event: LxdEvent) => {
    const eventCallback = eventQueue.get(event.metadata.id);
    if (!eventCallback) {
      return;
    }
    if (event.metadata.status === "Success") {
      eventCallback.onSuccess(event);
      eventCallback.onFinish?.();
      eventQueue.remove(event.metadata.id);
    }
    if (event.metadata.status === "Failure") {
      eventCallback.onFailure(event.metadata.err ?? "");
      eventCallback.onFinish?.();
      eventQueue.remove(event.metadata.id);
    }
  };

  const getLifecycleRootQueryKey = (event: LxdEvent) => {
    if (event.metadata.action.startsWith("auth-group-")) {
      return queryKeys.authGroups;
    }
    if (event.metadata.action.startsWith("config-")) {
      return queryKeys.settings;
    }
    if (event.metadata.action.startsWith("identity-provider-group-")) {
      return queryKeys.idpGroups;
    }
    if (event.metadata.action.startsWith("instance-")) {
      return queryKeys.instances;
    }
    if (event.metadata.action.startsWith("project-")) {
      return queryKeys.projects;
    }
    if (event.metadata.action.startsWith("profile-")) {
      return queryKeys.profiles;
    }
    if (event.metadata.action.startsWith("network-")) {
      return queryKeys.networks;
    }
    if (event.metadata.action.startsWith("storage-pool-")) {
      return queryKeys.storage;
    }
    if (event.metadata.action.startsWith("storage-volume-")) {
      return queryKeys.storage;
    }
    if (event.metadata.action.startsWith("image-")) {
      return queryKeys.images;
    }
    return "undefined";
  };

  const connectEventWs = () => {
    const wsUrl = `wss://${location.host}/1.0/events?type=operation,lifecycle&all-projects=true`;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      setEventWs(ws);
    };
    ws.onclose = () => {
      setEventWs(null);
    };
    ws.onmessage = (message: MessageEvent<Blob | string | null>) => {
      if (typeof message.data !== "string") {
        console.log("Invalid format on event api: ", message.data);
        return;
      }
      const event = JSON.parse(message.data) as LxdEvent;
      if (event.type === "operation") {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.operations, event.project],
        });
        refetchOperations();
      }
      if (event.type === "lifecycle") {
        const rootQueryKey = getLifecycleRootQueryKey(event);
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === rootQueryKey,
        });
      }
      // ensure open requests that reply with an operation and register
      // new handlers in the eventQueue are closed before handling the event
      setTimeout(() => {
        handleEvent(event);
      }, 250);
    };
  };

  useEffect(() => {
    if (!eventWs && isAuthenticated) {
      connectEventWs();
    }
  }, [eventWs, isAuthenticated]);
  return <></>;
};

export default Events;
