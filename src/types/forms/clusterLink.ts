import type { LxdClusterLinkType } from "types/cluster";

export interface ClusterLinkFormValues {
  name: string;
  description?: string;
  token?: string;
  tokenType?: "generate" | "consume";
  authGroups: string[];
  isCreating: boolean;
  initialAuthGroups?: string[];
  type: LxdClusterLinkType;
}
