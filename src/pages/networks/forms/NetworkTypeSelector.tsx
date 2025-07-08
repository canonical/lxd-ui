import type { FC } from "react";
import { Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useDocs } from "context/useDocs";
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
  const docBaseLink = useDocs();

  return (
    <Select
      id="networkType"
      name="networkType"
      help={
        formik.values.networkType === ovnType ? (
          <a
            href={`${docBaseLink}/howto/network_ovn_setup/#set-up-a-lxd-cluster-on-ovn`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn how to set up OVN
          </a>
        ) : undefined
      }
      required
      options={[
        {
          label: "Bridge",
          value: bridgeType,
        },
        {
          label: "Macvlan",
          value: macvlanType,
        },
        {
          label: "OVN",
          value: ovnType,
        },
        {
          label: "Physical",
          value: physicalType,
        },
        {
          label: "SR-IOV",
          value: sriovType,
        },
      ]}
      onChange={(e) => {
        if (e.target.value === bridgeType) {
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
        if (e.target.value === macvlanType) {
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
        if (e.target.value === ovnType) {
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
        if (e.target.value === physicalType) {
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
        if (e.target.value === sriovType) {
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
