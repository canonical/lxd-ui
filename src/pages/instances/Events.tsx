import React, { FC, useEffect, useState } from "react";
import { LxdEvent } from "types/event";
import { useEventQueue } from "context/eventQueue";
import { useAuth } from "context/auth";

const Events: FC = () => {
  const { isAuthenticated } = useAuth();
  const eventQueue = useEventQueue();
  const [eventWs, setEventWs] = useState<WebSocket | null>(null);

  const handleEvent = (event: LxdEvent) => {
    const eventCallback = eventQueue.get(event.metadata.id);
    if (!eventCallback) {
      return;
    }
    if (event.metadata.status === "Success") {
      eventCallback.onSuccess();
      eventQueue.remove(event.metadata.id);
    }
    if (event.metadata.status === "Failure") {
      eventCallback.onFailure(event.metadata.err ?? "");
      eventQueue.remove(event.metadata.id);
    }
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
      setTimeout(() => handleEvent(event), 1000); // handle with delay to allow operations to vanish
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
