import type { LxdInstance } from "types/instance";
import type { TerminalConnectPayload } from "types/terminal";

export const getDefaultPayload = (
  instance: LxdInstance,
  defaultPayload: TerminalConnectPayload,
) => {
  const userPayload = instance.config[UI_TERMINAL_DEFAULT_PAYLOAD];
  if (userPayload) {
    return JSON.parse(userPayload) as TerminalConnectPayload;
  }

  return defaultPayload;
};

export const UI_TERMINAL_DEFAULT_PAYLOAD = "user.ui_terminal_default_payload";
