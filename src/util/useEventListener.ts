import { useEffect } from "react";

type EventListenerEvents = HTMLElementEventMap &
  DocumentEventMap &
  WindowEventMap & {
    ["spice-wheel"]: Event;
  } & {
    ["sfp-toggle"]: Event;
  };

function useEventListener<K extends keyof EventListenerEvents>(
  eventName: K,
  handler: (event: EventListenerEvents[K]) => void,
  element: HTMLElement | Window | null = window,
) {
  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      handler(event as EventListenerEvents[K]);
    };
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, handler, element]);
}

export default useEventListener;
