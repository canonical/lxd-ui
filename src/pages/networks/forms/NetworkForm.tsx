import React, { FC, useEffect, useState } from "react";
import {
  Col,
  Form,
  Input,
  Notification,
  Row,
  useNotify,
} from "@canonical/react-components";
import {
  LxdNetwork,
  LxdNetworkBridgeDriver,
  LxdNetworkBridgeMode,
  LxdNetworkDnsMode,
  LxdNetworkFanType,
  LxdNetworkType,
} from "types/network";
import NetworkFormMenu, {
  BRIDGE,
  DNS,
  IPV4,
  IPV6,
  MAIN_CONFIGURATION,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import { FormikProps } from "formik/dist/types";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import YamlForm from "components/forms/YamlForm";
import NetworkFormMain from "pages/networks/forms/NetworkFormMain";
import NetworkFormBridge from "pages/networks/forms/NetworkFormBridge";
import NetworkFormDns from "pages/networks/forms/NetworkFormDns";
import NetworkFormIpv4 from "pages/networks/forms/NetworkFormIpv4";
import NetworkFormIpv6 from "pages/networks/forms/NetworkFormIpv6";

export interface NetworkFormValues {
  readOnly: boolean;
  name: string;
  description?: string;
  type: LxdNetworkType;
  bridge_driver?: LxdNetworkBridgeDriver;
  bridge_hwaddr?: string;
  bridge_mode?: LxdNetworkBridgeMode;
  bridge_mtu?: string;
  dns_domain?: string;
  dns_mode?: LxdNetworkDnsMode;
  dns_search?: string;
  fan_type?: LxdNetworkFanType;
  fan_overlay_subnet?: string;
  fan_underlay_subnet?: string;
  ipv4_address?: string;
  ipv4_dhcp?: string;
  ipv4_dhcp_expiry?: string;
  ipv4_dhcp_ranges?: string;
  ipv4_l3only?: string;
  ipv4_nat?: string;
  ipv4_nat_address?: string;
  ipv4_ovn_ranges?: string;
  ipv6_address?: string;
  ipv6_dhcp?: string;
  ipv6_dhcp_expiry?: string;
  ipv6_dhcp_ranges?: string;
  ipv6_dhcp_stateful?: string;
  ipv6_l3only?: string;
  ipv6_nat?: string;
  ipv6_nat_address?: string;
  ipv6_ovn_ranges?: string;
  network?: string;
  yaml?: string;
}

export const toNetwork = (values: NetworkFormValues): Partial<LxdNetwork> => {
  return {
    name: values.name,
    description: values.description,
    type: values.type,
    config: {
      ["bridge.driver"]: values.bridge_driver,
      ["bridge.hwaddr"]: values.bridge_hwaddr,
      ["bridge.mode"]: values.bridge_mode,
      ["bridge.mtu"]: values.bridge_mtu,
      ["dns.domain"]: values.dns_domain,
      ["dns.mode"]: values.dns_mode,
      ["dns.search"]: values.dns_search,
      ["fan.overlay_subnet"]: values.fan_overlay_subnet,
      ["fan.type"]: values.fan_type,
      ["fan.underlay_subnet"]: values.fan_underlay_subnet,
      ["ipv4.address"]: values.ipv4_address,
      ["ipv4.dhcp"]: values.ipv4_dhcp,
      ["ipv4.dhcp.expiry"]: values.ipv4_dhcp_expiry,
      ["ipv4.dhcp.ranges"]: values.ipv4_dhcp_ranges,
      ["ipv4.l3only"]: values.ipv4_l3only,
      ["ipv4.nat"]: values.ipv4_nat,
      ["ipv4.nat.address"]: values.ipv4_nat_address,
      ["ipv4.ovn.ranges"]: values.ipv4_ovn_ranges,
      ["ipv6.address"]: values.ipv6_address,
      ["ipv6.dhcp"]: values.ipv6_dhcp,
      ["ipv6.dhcp.expiry"]: values.ipv6_dhcp_expiry,
      ["ipv6.dhcp.ranges"]: values.ipv6_dhcp_ranges,
      ["ipv6.dhcp.stateful"]: values.ipv6_dhcp_stateful,
      ["ipv6.l3only"]: values.ipv6_l3only,
      ["ipv6.nat"]: values.ipv6_nat,
      ["ipv6.nat.address"]: values.ipv6_nat_address,
      ["ipv6.ovn.ranges"]: values.ipv6_ovn_ranges,
      ["network"]: values.network,
    },
  };
};

interface Props {
  formik: FormikProps<NetworkFormValues>;
  getYaml: () => string;
  project: string;
}

const NetworkForm: FC<Props> = ({ formik, getYaml, project }) => {
  const notify = useNotify();
  const [section, setSection] = useState(MAIN_CONFIGURATION);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  return (
    <Form className="form network-form" onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden />
      <NetworkFormMenu
        active={section}
        setActive={setSection}
        formik={formik}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          {section === MAIN_CONFIGURATION && (
            <NetworkFormMain formik={formik} project={project} />
          )}
          {section === BRIDGE && <NetworkFormBridge formik={formik} />}
          {section === DNS && <NetworkFormDns formik={formik} />}
          {section === IPV4 && <NetworkFormIpv4 formik={formik} />}
          {section === IPV6 && <NetworkFormIpv6 formik={formik} />}
          {section === YAML_CONFIGURATION && (
            <YamlForm
              yaml={getYaml()}
              setYaml={(yaml) => formik.setFieldValue("yaml", yaml)}
              isReadOnly={formik.values.readOnly}
            >
              <Notification severity="caution" title="Before you edit the YAML">
                Changes will be discarded, when switching back to the guided
                forms.
              </Notification>
            </YamlForm>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default NetworkForm;
