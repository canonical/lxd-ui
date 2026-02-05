export interface NetworkForwardFormValues {
  listenAddress: string;
  defaultTargetAddress?: string;
  description?: string;
  ports: NetworkForwardPortFormValues[];
  location?: string;
}

export interface NetworkForwardPortFormValues {
  listenPort: string;
  protocol: "tcp" | "udp";
  targetAddress: string;
  targetPort?: string;
}
