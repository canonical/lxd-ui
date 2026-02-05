import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "types/forms/network";
import DocLink from "components/DocLink";
import {
  bridgeType,
  macvlanType,
  ovnType,
  physicalType,
  sriovType,
} from "util/networks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkTypeSelector: FC<Props> = ({ formik }) => {
  return (
    <CustomSelect
      id="networkType"
      name="networkType"
      help={
        formik.values.networkType === ovnType ? (
          <DocLink docPath="/howto/network_ovn_setup/#set-up-a-lxd-cluster-on-ovn">
            Learn how to set up OVN
          </DocLink>
        ) : undefined
      }
      required
      searchable="never"
      options={[
        {
          label: (
            <div className="label network-type-label">
              <span className="network-type-name">Bridge</span>
              <span className="network-type-explanation u-text--muted">
                Setup local virtual subnet providing NAT, DHCP and DNS to
                instances.
              </span>
            </div>
          ),
          text: "Bridge",
          value: bridgeType,
        },
        {
          label: (
            <div className="label network-type-label">
              <span className="network-type-name">Macvlan</span>
              <span className="network-type-explanation u-text--muted">
                Connect instances to an existing network interface without a
                bridge.
              </span>
            </div>
          ),
          text: "Macvlan",
          value: macvlanType,
        },
        {
          label: (
            <div className="label network-type-label">
              <div className="network-type-name">OVN</div>
              <div className="network-type-explanation u-text--muted">
                Setup cluster-wide virtual subnet providing NAT, DHCP and DNS to
                instances.
              </div>
            </div>
          ),
          text: "OVN",
          value: ovnType,
        },
        {
          label: (
            <div className="label network-type-label">
              <span className="network-type-name">Physical</span>
              <span className="network-type-explanation u-text--muted">
                Define OVN uplink or pass-through existing physical interface to
                one instance.
              </span>
            </div>
          ),
          text: "Physical",
          value: physicalType,
        },
        {
          label: (
            <div className="label network-type-label">
              <span className="network-type-name">SR-IOV</span>
              <span className="network-type-explanation u-text--muted">
                Connect instances to an existing SR-IOV network interface.
              </span>
            </div>
          ),
          text: "SR-IOV",
          value: sriovType,
        },
      ]}
      onChange={(value) => {
        if (value === bridgeType) {
          formik.setFieldValue("networkType", bridgeType);
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("parent", undefined);
          formik.setFieldValue("parentPerClusterMember", undefined);
          formik.setFieldValue("dns_nameservers", undefined);
          formik.setFieldValue("gvrp", undefined);
          formik.setFieldValue("ipv4_address", "auto");
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv4_gateway", undefined);
          formik.setFieldValue("ipv4_routes", undefined);
          formik.setFieldValue("ipv4_routes_anycast", undefined);
          formik.setFieldValue("ipv6_address", "auto");
          formik.setFieldValue("ipv6_l3only", undefined);
          formik.setFieldValue("ipv6_gateway", undefined);
          formik.setFieldValue("ipv6_routes", undefined);
          formik.setFieldValue("ipv6_routes_anycast", undefined);
          formik.setFieldValue("mtu", undefined);
          formik.setFieldValue("ovn_ingress_mode", undefined);
        }
        if (value === macvlanType) {
          formik.setFieldValue("networkType", macvlanType);
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("bridge_driver", undefined);
          formik.setFieldValue("bridge_external_interfaces", undefined);
          formik.setFieldValue("bridge_hwaddr", undefined);
          formik.setFieldValue("bridge_mtu", undefined);
          formik.setFieldValue("dns_domain", undefined);
          formik.setFieldValue("dns_mode", undefined);
          formik.setFieldValue("dns_search", undefined);
          formik.setFieldValue("ipv4_address", undefined);
          formik.setFieldValue("ipv4_dhcp", undefined);
          formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          formik.setFieldValue("ipv4_ovn_ranges", undefined);
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv6_address", undefined);
          formik.setFieldValue("ipv6_dhcp", undefined);
          formik.setFieldValue("ipv6_dhcp_stateful", undefined);
          formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          formik.setFieldValue("ipv6_ovn_ranges", undefined);
          formik.setFieldValue("ipv6_l3only", undefined);
          formik.setFieldValue("ovn_ingress_mode", undefined);
          formik.setFieldValue("security_acls", []);
        }
        if (value === ovnType) {
          formik.setFieldValue("networkType", ovnType);
          formik.setFieldValue("bridge_driver", undefined);
          formik.setFieldValue("bridge_external_interfaces", undefined);
          formik.setFieldValue("dns_mode", undefined);
          formik.setFieldValue("gvrp", undefined);
          formik.setFieldValue("parent", undefined);
          formik.setFieldValue("parentPerClusterMember", undefined);
          formik.setFieldValue("dns_nameservers", undefined);
          formik.setFieldValue("ipv4_address", "auto");
          formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          formik.setFieldValue("ipv4_ovn_ranges", undefined);
          formik.setFieldValue("ipv4_gateway", undefined);
          formik.setFieldValue("ipv4_routes", undefined);
          formik.setFieldValue("ipv4_routes_anycast", undefined);
          formik.setFieldValue("ipv6_address", "auto");
          formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          formik.setFieldValue("ipv6_ovn_ranges", undefined);
          formik.setFieldValue("ipv6_gateway", undefined);
          formik.setFieldValue("ipv6_routes", undefined);
          formik.setFieldValue("ipv6_routes_anycast", undefined);
          formik.setFieldValue("mtu", undefined);
          formik.setFieldValue("ovn_ingress_mode", undefined);
        }
        if (value === physicalType) {
          formik.setFieldValue("networkType", physicalType);
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("bridge_driver", undefined);
          formik.setFieldValue("bridge_external_interfaces", undefined);
          formik.setFieldValue("bridge_hwaddr", undefined);
          formik.setFieldValue("bridge_mtu", undefined);
          formik.setFieldValue("dns_domain", undefined);
          formik.setFieldValue("dns_mode", undefined);
          formik.setFieldValue("dns_search", undefined);
          formik.setFieldValue("gvrp", undefined);
          formik.setFieldValue("ipv4_address", undefined);
          formik.setFieldValue("ipv4_dhcp", undefined);
          formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          formik.setFieldValue("ipv4_ovn_ranges", undefined);
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv6_address", undefined);
          formik.setFieldValue("ipv6_dhcp", undefined);
          formik.setFieldValue("ipv6_dhcp_stateful", undefined);
          formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          formik.setFieldValue("ipv6_ovn_ranges", undefined);
          formik.setFieldValue("ipv6_l3only", undefined);
          formik.setFieldValue("mtu", undefined);
          formik.setFieldValue("security_acls", []);
        }
        if (value === sriovType) {
          formik.setFieldValue("networkType", sriovType);
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("bridge_driver", undefined);
          formik.setFieldValue("bridge_external_interfaces", undefined);
          formik.setFieldValue("bridge_hwaddr", undefined);
          formik.setFieldValue("bridge_mtu", undefined);
          formik.setFieldValue("dns_domain", undefined);
          formik.setFieldValue("dns_mode", undefined);
          formik.setFieldValue("dns_search", undefined);
          formik.setFieldValue("gvrp", undefined);
          formik.setFieldValue("ipv4_address", undefined);
          formik.setFieldValue("ipv4_dhcp", undefined);
          formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          formik.setFieldValue("ipv4_ovn_ranges", undefined);
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv6_address", undefined);
          formik.setFieldValue("ipv6_dhcp", undefined);
          formik.setFieldValue("ipv6_dhcp_stateful", undefined);
          formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          formik.setFieldValue("ipv6_ovn_ranges", undefined);
          formik.setFieldValue("ipv6_l3only", undefined);
          formik.setFieldValue("ovn_ingress_mode", undefined);
          formik.setFieldValue("security_acls", []);
        }
      }}
      value={formik.values.networkType}
      disabled={formik.values.readOnly || !formik.values.isCreating}
    />
  );
};

export default NetworkTypeSelector;
