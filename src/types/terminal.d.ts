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

export interface TerminalConnectPayload {
  command: string;
  environment: {
    key: string;
    value: string;
  }[];
  user: number;
  group: number;
}
