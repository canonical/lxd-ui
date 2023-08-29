import React, { FC } from "react";
import { Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useSettings } from "context/useSettings";
import { supportsFanNetwork, supportsOvnNetwork } from "util/settings";
import Loader from "components/Loader";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkTypeSelector: FC<Props> = ({ formik }) => {
  const { data: settings, isLoading } = useSettings();
  const hasOvn = supportsOvnNetwork(settings);
  const hasFan = supportsFanNetwork(settings);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Select
      id="type"
      name="type"
      label="Type"
      help={
        <>
          Bridge (FAN) is only available on ubuntu, OVN needs to be configured
          in LXD as <code>network.ovn.northbound_connection</code>{" "}
          <a
            href="https://documentation.ubuntu.com/lxd/en/latest/howto/network_ovn_setup/#set-up-a-lxd-cluster-on-ovn"
            target="_blank"
            rel="noreferrer"
          >
            Learn how to set up a LXD cluster on OVN
          </a>
        </>
      }
      required
      options={[
        {
          label: "Bridge (standard)",
          value: "bridge-standard",
        },
        {
          label: "Bridge (FAN)",
          value: "bridge-fan",
          disabled: !hasFan,
        },
        {
          label: "OVN",
          value: "ovn",
          disabled: !hasOvn,
        },
      ]}
      onChange={(e) => {
        if (e.target.value === "bridge-standard") {
          formik.setFieldValue("type", "bridge");
          formik.setFieldValue("bridge_mode", "standard");
          formik.setFieldValue("fan_type", undefined);
          formik.setFieldValue("fan_overlay_subnet", undefined);
          formik.setFieldValue("fan_underlay_subnet", undefined);
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv6_l3only", undefined);
        }
        if (e.target.value === "bridge-fan") {
          formik.setFieldValue("type", "bridge");
          formik.setFieldValue("bridge_mode", "fan");
          formik.setFieldValue("ipv4_address", undefined);
          formik.setFieldValue("ipv6_address", undefined);
          formik.setFieldValue("ipv6_nat", undefined);
          formik.setFieldValue("network", undefined);
          formik.setFieldValue("ipv4_l3only", undefined);
          formik.setFieldValue("ipv6_l3only", undefined);
        }
        if (e.target.value === "ovn") {
          formik.setFieldValue("type", "ovn");
          formik.setFieldValue("bridge_mode", undefined);
          formik.setFieldValue("fan_type", undefined);
          formik.setFieldValue("fan_overlay_subnet", undefined);
          formik.setFieldValue("fan_underlay_subnet", undefined);
          formik.setFieldValue("bridge_driver", undefined);
          formik.setFieldValue("dns_mode", undefined);
          formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          formik.setFieldValue("ipv4_ovn_ranges", undefined);
          formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          formik.setFieldValue("ipv6_ovn_ranges", undefined);
        }
      }}
      value={
        formik.values.type === "bridge"
          ? `bridge-${formik.values.bridge_mode ?? "standard"}`
          : formik.values.type
      }
      disabled={formik.values.readOnly}
    />
  );
};

export default NetworkTypeSelector;
