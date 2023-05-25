export interface LxdEvent {
  type: string;
  timestamp: string;
  metadata: {
    id: string;
    action: string;
    description: string;
    source: string;
    resources: {
      instances: [string];
    };
    status: "Failure" | "Success";
    err?: string;
  };
  location: string;
  project: string;
}
