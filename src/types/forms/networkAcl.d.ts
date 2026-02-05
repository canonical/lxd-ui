import type { LxdNetworkAcl } from "types/network";

export interface NetworkAclRuleFormValues {
  index?: number;
  action: "allow" | "reject" | "drop";
  description?: string;
  destination?: string;
  destination_port?: string;
  icmp_code?: string;
  icmp_type?: string;
  protocol?: "icmp4" | "icmp6" | "tcp" | "udp";
  source?: string;
  source_port?: string;
  state?: "enabled" | "disabled" | "logged";
}

export interface NetworkAclFormValues {
  readOnly: boolean;
  isCreating: boolean;
  name: string;
  description?: string;
  egress: NetworkAclRuleFormValues[];
  ingress: NetworkAclRuleFormValues[];
  yaml?: string;
  editRestriction?: string;
  bareAcl?: LxdNetworkAcl;
  entityType: "network-acl";
}
