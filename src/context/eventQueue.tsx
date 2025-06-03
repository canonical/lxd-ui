import type { LxdEvent } from "types/event";
import { createEventQueue } from "@canonical/react-components";
import type { EventQueue as ReactComponentEventQueue } from "@canonical/react-components";

export type EventQueue = ReactComponentEventQueue<LxdEvent>;

export const { EventQueueProvider, useEventQueue } =
  createEventQueue<LxdEvent>();
