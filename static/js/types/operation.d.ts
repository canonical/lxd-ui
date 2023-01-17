export interface LxdOperation {
  operation: string;
  metadata: {
    err?: string;
    resources: {
      instances: string[];
    }
    status: "Success" | "Running" | "Started";
  };
}
