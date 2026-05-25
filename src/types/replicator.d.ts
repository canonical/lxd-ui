export type LxdReplicatorStatus =
  | "Pending"
  | "Running"
  | "Completed"
  | "Failed";

export interface LxdReplicator {
  name: string;
  description: string;
  project: string;
  config: {
    cluster: string;
    snapshot: boolean;
    schedule: string;
  };
  last_run_at: string;
  last_run_status: LxdReplicatorStatus;
  access_entitlements?: string[];
}

export interface LxdReplicatorState {
  status: LxdReplicatorStatus;
}
