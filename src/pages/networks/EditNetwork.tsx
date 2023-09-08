import React, { FC, useState } from "react";
import { Button, Col, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNotify } from "context/notify";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { useNavigate } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import { updateNetwork } from "api/networks";
import NetworkForm, {
  NetworkFormValues,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import { LxdNetwork } from "types/network";
import { yamlToObject } from "util/yaml";
import { dump as dumpYaml } from "js-yaml";

interface Props {
  network: LxdNetwork;
  project: string;
}

const EditNetwork: FC<Props> = ({ network, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A network with this name already exists",
        (value) =>
          value === network.name ||
          checkDuplicateName(value, project, controllerState, "networks")
      )
      .required("Network name is required"),
  });

  const formik = useFormik<NetworkFormValues>({
    initialValues: {
      name: network.name,
      description: network.description,
      type: network.type,
      bridge_driver: network.config["bridge.driver"],
      bridge_external_interfaces: network.config["bridge.external_interfaces"],
      bridge_hwaddr: network.config["bridge.hwaddr"],
      bridge_mode: network.config["bridge.mode"],
      bridge_mtu: network.config["bridge.mtu"],
      dns_domain: network.config["dns.domain"],
      dns_mode: network.config["dns.mode"],
      dns_search: network.config["dns.search"],
      dns_zone_forward: network.config["dns.zone.forward"],
      dns_zone_reverse_ipv4: network.config["dns.zone.reverse.ipv4"],
      dns_zone_reverse_ipv6: network.config["dns.zone.reverse.ipv6"],
      fan_type: network.config["fan.type"],
      fan_overlay_subnet: network.config["fan.overlay_subnet"],
      fan_underlay_subnet: network.config["fan.underlay_subnet"],
      ipv4_address: network.config["ipv4.address"],
      ipv4_dhcp: network.config["ipv4.dhcp"],
      ipv4_dhcp_expiry: network.config["ipv4.dhcp.expiry"],
      ipv4_dhcp_gateway: network.config["ipv4.dhcp.gateway"],
      ipv4_dhcp_ranges: network.config["ipv4.dhcp.ranges"],
      ipv4_firewall: network.config["ipv4.firewall"],
      ipv4_l3only: network.config["ipv4.l3only"],
      ipv4_nat: network.config["ipv4.nat"],
      ipv4_nat_address: network.config["ipv4.nat.address"],
      ipv4_nat_order: network.config["ipv4.nat.order"],
      ipv4_ovn_ranges: network.config["ipv4.ovn.ranges"],
      ipv4_routes: network.config["ipv4.routes"],
      ipv4_routing: network.config["ipv4.routing"],
      ipv6_address: network.config["ipv6.address"],
      ipv6_dhcp: network.config["ipv6.dhcp"],
      ipv6_dhcp_expiry: network.config["ipv6.dhcp.expiry"],
      ipv6_dhcp_ranges: network.config["ipv6.dhcp.ranges"],
      ipv6_dhcp_stateful: network.config["ipv6.dhcp.stateful"],
      ipv6_firewall: network.config["ipv6.firewall"],
      ipv6_l3only: network.config["ipv6.l3only"],
      ipv6_nat: network.config["ipv6.nat"],
      ipv6_nat_address: network.config["ipv6.nat.address"],
      ipv6_nat_order: network.config["ipv6.nat.order"],
      ipv6_ovn_ranges: network.config["ipv6.ovn.ranges"],
      ipv6_ovn_routes: network.config["ipv6.ovn.routes"],
      ipv6_ovn_routing: network.config["ipv6.ovn.routing"],
      user: Object.entries(network.config)
        .filter(([key]) => key.startsWith("user."))
        .map(([key, value]) => {
          return { key: key.slice("user.".length), value };
        }),
    },
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const yaml = values.yaml ? values.yaml : getYaml();
      const saveNetwork = yamlToObject(yaml);
      updateNetwork({ ...saveNetwork, etag: network.etag }, project)
        .then(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.networks],
          });
          notify.success("Network updated.");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network update failed", e);
        });
    },
  });

  const getYaml = () => {
    const exclude = new Set([
      "used_by",
      "etag",
      "status",
      "locations",
      "managed",
    ]);
    const bareNetwork = Object.fromEntries(
      Object.entries(network).filter((e) => !exclude.has(e[0]))
    );
    const formValues = toNetwork(formik.values);
    return dumpYaml({ ...bareNetwork, ...formValues });
  };

  return (
    <>
      <NetworkForm formik={formik} getYaml={getYaml} />
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            <Button
              appearance="base"
              onClick={() => navigate(`/ui/project/${project}/networks`)}
            >
              Cancel
            </Button>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid || !formik.values.name}
              buttonLabel="Update"
              onClick={() => void formik.submitForm()}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default EditNetwork;
