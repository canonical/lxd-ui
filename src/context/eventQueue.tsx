import type { LxdEvent } from "types/event";
import { createEventQueue } from "@canonical/react-components";
import type { EventQueue as ReactComponentEventQueue } from "@canonical/react-components";
import type { LxdOperation } from "types/operation";

export type EventQueue = ReactComponentEventQueue<LxdEvent | LxdOperation>;

export const { EventQueueProvider, useEventQueue } = createEventQueue<
  LxdEvent | LxdOperation
>();
