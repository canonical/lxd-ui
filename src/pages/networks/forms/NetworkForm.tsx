import React, { FC, ReactNode, useEffect, useState } from "react";
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
  LxdNetworkDnsMode,
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
import { slugify } from "util/slugify";
import { handleConfigKeys } from "util/networkForm";
import { useDocs } from "context/useDocs";
import YamlConfirmation from "components/forms/YamlConfirmation";

export interface NetworkFormValues {
  readOnly: boolean;
  isCreating: boolean;
  name: string;
  description?: string;
  networkType: LxdNetworkType;
  bridge_driver?: LxdNetworkBridgeDriver;
  bridge_hwaddr?: string;
  bridge_mtu?: string;
  dns_domain?: string;
  dns_mode?: LxdNetworkDnsMode;
  dns_search?: string;
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
  entityType: "network";
  bareNetwork?: LxdNetwork;
}

export const toNetwork = (values: NetworkFormValues): Partial<LxdNetwork> => {
  const excludeMainKeys = new Set([
    "used_by",
    "etag",
    "status",
    "locations",
    "managed",
    "name",
    "description",
    "config",
    "type",
  ]);
  const missingMainFields = Object.fromEntries(
    Object.entries(values.bareNetwork ?? {}).filter(
      (e) => !excludeMainKeys.has(e[0]),
    ),
  );

  const excludeConfigKeys = new Set(handleConfigKeys);
  const missingConfigFields = Object.fromEntries(
    Object.entries(values.bareNetwork?.config ?? {}).filter(
      (e) => !excludeConfigKeys.has(e[0]) && !e[0].startsWith("volatile"),
    ),
  );

  return {
    ...missingMainFields,
    name: values.name,
    description: values.description,
    type: values.networkType,
    config: {
      ...missingConfigFields,
      ["bridge.driver"]: values.bridge_driver,
      ["bridge.hwaddr"]: values.bridge_hwaddr,
      ["bridge.mtu"]: values.bridge_mtu,
      ["dns.domain"]: values.dns_domain,
      ["dns.mode"]: values.dns_mode,
      ["dns.search"]: values.dns_search,
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
  section: string;
  setSection: (section: string) => void;
}

const NetworkForm: FC<Props> = ({
  formik,
  getYaml,
  project,
  section,
  setSection,
}) => {
  const [confirmModal, setConfirmModal] = useState<ReactNode | null>(null);
  const docBaseLink = useDocs();
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const handleSetActive = (val: string) => {
    if (Boolean(formik.values.yaml) && val !== YAML_CONFIGURATION) {
      const handleConfirm = () => {
        void formik.setFieldValue("yaml", undefined);
        setConfirmModal(null);
        setSection(val);
      };

      setConfirmModal(
        <YamlConfirmation
          onConfirm={handleConfirm}
          close={() => setConfirmModal(null)}
        />,
      );
    } else {
      setSection(val);
    }
  };

  return (
    <Form className="form network-form" onSubmit={formik.handleSubmit}>
      {confirmModal}
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <NetworkFormMenu
        active={section}
        setActive={handleSetActive}
        formik={formik}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          {section === slugify(MAIN_CONFIGURATION) && (
            <NetworkFormMain formik={formik} project={project} />
          )}
          {section === slugify(BRIDGE) && <NetworkFormBridge formik={formik} />}
          {section === slugify(DNS) && <NetworkFormDns formik={formik} />}
          {section === slugify(IPV4) && <NetworkFormIpv4 formik={formik} />}
          {section === slugify(IPV6) && <NetworkFormIpv6 formik={formik} />}
          {section === slugify(YAML_CONFIGURATION) && (
            <YamlForm
              key={`yaml-form-${formik.values.readOnly}`}
              yaml={getYaml()}
              setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
              readOnly={formik.values.readOnly}
            >
              <Notification severity="information" title="YAML Configuration">
                This is the YAML representation of the network.
                <br />
                <a
                  href={`${docBaseLink}/explanation/networks/#managed-networks`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about networks
                </a>
              </Notification>
            </YamlForm>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default NetworkForm;
