import type { LxdClusterGroup } from "types/cluster";

export interface ClusterGroupFormValues {
  name: string;
  description: string;
  members: string[];
  bareGroup?: LxdClusterGroup;
}
