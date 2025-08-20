import type { FC } from "react";
import { useEffect, useState } from "react";
import type { LxdEvent } from "types/event";
import { useEventQueue } from "context/eventQueue";
import { useAuth } from "context/auth";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useOperations } from "context/operationsProvider";
import { useListener, useNotify } from "@canonical/react-components";
import { useMemberLoading } from "context/memberLoading";

const EVENT_HANDLER_DELAY = 250;
const WS_RETRY_DELAY_MULTIPLIER = 250;
const MAX_WS_CONNECTION_RETRIES = 5;
const EVENT_WS_STALE_TIMEOUT_MS = 3_600_000;

const Events: FC = () => {
  const { isAuthenticated } = useAuth();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [eventWs, setEventWs] = useState<WebSocket | null>(null);
  const [reconnectWsId, setReconnectWsId] = useState(0);
  const [wsOpenTime, setWsOpenTime] = useState(0);
  const { refetchOperations } = useOperations();
  const memberLoading = useMemberLoading();

  const getCurrentTime = () => {
    return new Date().getTime();
  };

  const reconnectWsOnFocusTab = () => {
    if (document.visibilityState !== "visible") {
      return;
    }
    // Force reconnect if the ws is not open.
    if (!eventWs) {
      setReconnectWsId((prevId) => prevId + 1);
      return;
    }
    // If the ws was open for more than EVENT_WS_STALE_TIMEOUT_MS, close it to
    // trigger a reconnect. In some proxy setups, the ws connection can
    // become stale and stop receiving messages, but the browser still thinks
    // the connection is open. This time based reconnect is a workaround.
    const timeSinceOpen = getCurrentTime() - wsOpenTime;
    const isStale = timeSinceOpen > EVENT_WS_STALE_TIMEOUT_MS;
    if (isStale && eventWs) {
      eventWs.close();
    }
  };
  useListener(window, reconnectWsOnFocusTab, "visibilitychange");

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

  const updateClusterMemberLoading = (event: LxdEvent) => {
    const description = event.metadata.description;
    const isEvacuating = description === "Evacuating cluster member";
    const isRestoring = description === "Restoring cluster member";
    if (!isEvacuating && !isRestoring) {
      return;
    }

    if (event.metadata.status === "Running") {
      const loadingType = isRestoring ? "Restoring" : "Evacuating";
      memberLoading.setLoading(event.metadata.location as string, loadingType);
    } else {
      memberLoading.setFinish(event.metadata.location as string);
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === queryKeys.cluster,
      });
    }
  };

  const connectEventWs = (retryCount = 0) => {
    try {
      const wsUrl = `wss://${location.host}/1.0/events?type=operation,lifecycle&all-projects=true`;
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        setEventWs(ws);
        setWsOpenTime(getCurrentTime());
      };
      ws.onclose = () => {
        setEventWs(null);
      };
      ws.onerror = () => {
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
        updateClusterMemberLoading(event);
        // ensure open requests that reply with an operation and register
        // new handlers in the eventQueue are closed before handling the event
        setTimeout(() => {
          handleEvent(event);
        }, EVENT_HANDLER_DELAY);
      };
    } catch (e) {
      if (retryCount < MAX_WS_CONNECTION_RETRIES) {
        setTimeout(() => {
          connectEventWs(retryCount + 1);
        }, WS_RETRY_DELAY_MULTIPLIER * retryCount);
      } else {
        notify.failure("Failed to connect to event api", e);
      }
    }
  };

  useEffect(() => {
    if (!eventWs && isAuthenticated) {
      connectEventWs();
    }
    return () => {
      if (eventWs) {
        eventWs.close();
      }
    };
  }, [eventWs, isAuthenticated, reconnectWsId]);
  return <></>;
};

export default Events;
