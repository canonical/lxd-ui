export interface LxdEvent {
  type: string;
  timestamp: string;
  metadata: {
    id: string;
    action: string;
    description: string;
    location?: string;
    metadata?: {
      fingerprint?: string;
    };
    source: string;
    resources: {
      instances: [string];
    };
    status: "Failure" | "Success" | "Running";
    err?: string;
  };
  location: string;
  project: string;
}
