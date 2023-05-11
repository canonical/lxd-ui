export interface LxdOperation {
  class: string;
  created_at: string;
  description: string;
  err: string;
  id: string;
  location: string;
  metadata?: Record<string, string>;
  may_cancel: boolean;
  resources: {
    instances?: string[];
  };
  status: "Success" | "Running" | "Started";
  status_code: string;
  updated_at: string;
}

export interface LxdOperationResponse {
  operation: string;
  metadata: LxdOperation;
}

export interface LxdOperationList {
  failure: LxdOperation[];
  running: LxdOperation[];
  success: LxdOperation[];
}
