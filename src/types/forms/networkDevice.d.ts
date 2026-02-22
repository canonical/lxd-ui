export interface NetworkDeviceFormValues {
  name: string;
  network: string;
  acls?: string;
  ipv4?: string;
  ipv6?: string;
  security_acls_default_ingress_action?: string;
  security_acls_default_egress_action?: string;
}
