import { FC } from "react";
import { Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useSettings } from "context/useSettings";
import { supportsOvnNetwork } from "util/settings";
import Loader from "components/Loader";
import { useDocs } from "context/useDocs";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkTypeSelector: FC<Props> = ({ formik }) => {
  const docBaseLink = useDocs();
  const { data: settings, isLoading } = useSettings();
  const hasOvn = supportsOvnNetwork(settings);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Select
      id="networkType"
      name="networkType"
      label="Type"
      help={
        hasOvn ? undefined : (
          <>
            OVN needs to be configured.{" "}
            <a
              href={`${docBaseLink}/howto/network_ovn_setup/#set-up-a-lxd-cluster-on-ovn`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn how to set up OVN
            </a>
          </>
        )
      }
      required
      options={[
        {
          label: "Bridge",
          value: "bridge",
        },
        {
          label: hasOvn ? "OVN" : "OVN (not configured)",
          value: "ovn",
          disabled: !hasOvn,
        },
        {
          label: "Physical",
          value: "physical",
        },
      ]}
      onChange={(e) => {
        if (e.target.value === "bridge") {
          void formik.setFieldValue("networkType", "bridge");
          void formik.setFieldValue("network", undefined);
          void formik.setFieldValue("parent", undefined);
          void formik.setFieldValue("dns_nameservers", undefined);
          void formik.setFieldValue("ipv4_l3only", undefined);
          void formik.setFieldValue("ipv4_gateway", undefined);
          void formik.setFieldValue("ipv4_routes", undefined);
          void formik.setFieldValue("ipv4_routes_anycast", undefined);
          void formik.setFieldValue("ipv6_l3only", undefined);
          void formik.setFieldValue("ipv6_gateway", undefined);
          void formik.setFieldValue("ipv6_routes", undefined);
          void formik.setFieldValue("ipv6_routes_anycast", undefined);
          void formik.setFieldValue("ovn_ingress_mode", undefined);
        }
        if (e.target.value === "ovn") {
          void formik.setFieldValue("networkType", "ovn");
          void formik.setFieldValue("bridge_driver", undefined);
          void formik.setFieldValue("dns_mode", undefined);
          void formik.setFieldValue("parent", undefined);
          void formik.setFieldValue("dns_nameservers", undefined);
          void formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          void formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          void formik.setFieldValue("ipv4_ovn_ranges", undefined);
          void formik.setFieldValue("ipv4_gateway", undefined);
          void formik.setFieldValue("ipv4_routes", undefined);
          void formik.setFieldValue("ipv4_routes_anycast", undefined);
          void formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          void formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          void formik.setFieldValue("ipv6_ovn_ranges", undefined);
          void formik.setFieldValue("ipv6_gateway", undefined);
          void formik.setFieldValue("ipv6_routes", undefined);
          void formik.setFieldValue("ipv6_routes_anycast", undefined);
          void formik.setFieldValue("ovn_ingress_mode", undefined);
        }
        if (e.target.value === "physical") {
          void formik.setFieldValue("networkType", "physical");
          void formik.setFieldValue("network", undefined);
          void formik.setFieldValue("bridge_driver", undefined);
          void formik.setFieldValue("bridge_hwaddr", undefined);
          void formik.setFieldValue("bridge_mtu", undefined);
          void formik.setFieldValue("dns_domain", undefined);
          void formik.setFieldValue("dns_mode", undefined);
          void formik.setFieldValue("dns_search", undefined);
          void formik.setFieldValue("ipv4_address", undefined);
          void formik.setFieldValue("ipv4_dhcp", undefined);
          void formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          void formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          void formik.setFieldValue("ipv4_ovn_ranges", undefined);
          void formik.setFieldValue("ipv4_l3only", undefined);
          void formik.setFieldValue("ipv6_address", undefined);
          void formik.setFieldValue("ipv6_dhcp", undefined);
          void formik.setFieldValue("ipv6_dhcp_stateful", undefined);
          void formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          void formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          void formik.setFieldValue("ipv6_ovn_ranges", undefined);
          void formik.setFieldValue("ipv6_l3only", undefined);
        }
      }}
      value={formik.values.networkType}
      disabled={formik.values.readOnly || !formik.values.isCreating}
    />
  );
};

export default NetworkTypeSelector;
