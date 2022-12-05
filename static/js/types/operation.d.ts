export interface LxdOperation {
  operation: string;
  metadata: {
    status: "Success" | "Running" | "Started";
    err?: string;
  };
}
