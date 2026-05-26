export interface ReplicatorFormValues {
  name: string;
  project: string;
  description?: string;
  cluster: string;
  snapshot: "true" | "false";
  schedule: string;
  isCreating?: boolean;
}
