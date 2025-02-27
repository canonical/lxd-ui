import type { FC } from "react";
import { Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useDocs } from "context/useDocs";

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
        formik.values.networkType === "ovn" ? (
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
          value: "bridge",
        },
        {
          label: "OVN",
          value: "ovn",
        },
        {
          label: "Physical",
          value: "physical",
        },
      ]}
      onChange={(e) => {
        if (e.target.value === "bridge") {
          formik.setFieldValue("networkType", "bridge");
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("parent", undefined);
          formik.setFieldValue("parentPerClusterMember", undefined);
          formik.setFieldValue("dns_nameservers", undefined);
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv4_gateway", undefined);
          formik.setFieldValue("ipv4_routes", undefined);
          formik.setFieldValue("ipv4_routes_anycast", undefined);
          formik.setFieldValue("ipv6_l3only", undefined);
          formik.setFieldValue("ipv6_gateway", undefined);
          formik.setFieldValue("ipv6_routes", undefined);
          formik.setFieldValue("ipv6_routes_anycast", undefined);
          formik.setFieldValue("ovn_ingress_mode", undefined);
        }
        if (e.target.value === "ovn") {
          formik.setFieldValue("networkType", "ovn");
          formik.setFieldValue("bridge_driver", undefined);
          formik.setFieldValue("dns_mode", undefined);
          formik.setFieldValue("parent", undefined);
          formik.setFieldValue("parentPerClusterMember", undefined);
          formik.setFieldValue("dns_nameservers", undefined);
          formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          formik.setFieldValue("ipv4_ovn_ranges", undefined);
          formik.setFieldValue("ipv4_gateway", undefined);
          formik.setFieldValue("ipv4_routes", undefined);
          formik.setFieldValue("ipv4_routes_anycast", undefined);
          formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          formik.setFieldValue("ipv6_ovn_ranges", undefined);
          formik.setFieldValue("ipv6_gateway", undefined);
          formik.setFieldValue("ipv6_routes", undefined);
          formik.setFieldValue("ipv6_routes_anycast", undefined);
          formik.setFieldValue("ovn_ingress_mode", undefined);
        }
        if (e.target.value === "physical") {
          formik.setFieldValue("networkType", "physical");
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("bridge_driver", undefined);
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
        }
      }}
      value={formik.values.networkType}
      disabled={formik.values.readOnly || !formik.values.isCreating}
    />
  );
};

export default NetworkTypeSelector;
