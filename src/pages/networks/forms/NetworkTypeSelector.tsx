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
      ]}
      onChange={(e) => {
        if (e.target.value === "bridge") {
          void formik.setFieldValue("networkType", "bridge");
          void formik.setFieldValue("network", undefined);
          void formik.setFieldValue("ipv4_l3only", undefined);
          void formik.setFieldValue("ipv6_l3only", undefined);
        }
        if (e.target.value === "ovn") {
          void formik.setFieldValue("networkType", "ovn");
          void formik.setFieldValue("bridge_driver", undefined);
          void formik.setFieldValue("dns_mode", undefined);
          void formik.setFieldValue("ipv4_dhcp_expiry", undefined);
          void formik.setFieldValue("ipv4_dhcp_ranges", undefined);
          void formik.setFieldValue("ipv4_ovn_ranges", undefined);
          void formik.setFieldValue("ipv6_dhcp_expiry", undefined);
          void formik.setFieldValue("ipv6_dhcp_ranges", undefined);
          void formik.setFieldValue("ipv6_ovn_ranges", undefined);
        }
      }}
      value={formik.values.networkType}
      disabled={formik.values.readOnly}
    />
  );
};

export default NetworkTypeSelector;
