export interface LxdTerminal {
  operation: string;
  metadata: {
    metadata: {
      fds: {
        0: string;
        control: string;
      };
    };
  };
}

export interface LxdTerminalPayload {
  command: string[];
  "record-output": boolean;
  "wait-for-websocket": boolean;
  interactive: boolean;
  environment: {};
  user?: number;
  group?: number;
}
