import React, { FC, ReactNode, useEffect, useState } from "react";
import {
  CheckboxInput,
  Col,
  Form,
  Input,
  Notification,
  Row,
  Select,
  Textarea,
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
import { useNotify } from "context/notify";
import { useSettings } from "context/useSettings";
import Loader from "components/Loader";
import YamlForm from "pages/instances/forms/YamlForm";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import IpAddressSelector from "pages/networks/forms/IpAddressSelector";
import ConfigurationTable from "pages/networks/forms/ConfigurationTable";
import { getConfigurationRow } from "pages/networks/forms/ConfigurationRow";

export interface NetworkFormValues {
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
  dns_zone_forward?: string;
  dns_zone_reverse_ipv4?: string;
  dns_zone_reverse_ipv6?: string;
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
  ipv4_nat_order?: string;
  ipv4_ovn_ranges?: string;
  ipv6_address?: string;
  ipv6_dhcp?: string;
  ipv6_dhcp_expiry?: string;
  ipv6_dhcp_ranges?: string;
  ipv6_dhcp_stateful?: string;
  ipv6_l3only?: string;
  ipv6_nat?: string;
  ipv6_nat_address?: string;
  ipv6_nat_order?: string;
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
      ["dns.zone.forward"]: values.dns_zone_forward,
      ["dns.zone.reverse.ipv4"]: values.dns_zone_reverse_ipv4,
      ["dns.zone.reverse.ipv6"]: values.dns_zone_reverse_ipv6,
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
      ["ipv4.nat.order"]: values.ipv4_nat_order,
      ["ipv4.ovn.ranges"]: values.ipv4_ovn_ranges,
      ["ipv6.address"]: values.ipv6_address,
      ["ipv6.dhcp"]: values.ipv6_dhcp,
      ["ipv6.dhcp.expiry"]: values.ipv6_dhcp_expiry,
      ["ipv6.dhcp.ranges"]: values.ipv6_dhcp_ranges,
      ["ipv6.dhcp.stateful"]: values.ipv6_dhcp_stateful,
      ["ipv6.l3only"]: values.ipv6_l3only,
      ["ipv6.nat"]: values.ipv6_nat,
      ["ipv6.nat.address"]: values.ipv6_nat_address,
      ["ipv6.nat.order"]: values.ipv6_nat_order,
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
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const hasOvn = Boolean(settings?.config["network.ovn.northbound_connection"]);
  const hasFan = settings?.environment?.os_name
    ?.toLowerCase()
    .includes("ubuntu");

  const { data: networks = [], isLoading: isNetworkLoading } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  if (isSettingsLoading || isNetworkLoading) {
    return <Loader />;
  }

  const getNetworkOptions = () => {
    const options = networks.map((network) => {
      return {
        label: network.name,
        value: network.name,
      };
    });
    options.unshift({
      label: networks.length === 0 ? "No networks available" : "Select option",
      value: "",
    });
    return options;
  };

  const getFormProps = (id: keyof Omit<NetworkFormValues, "user">) => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  return (
    <Form
      className="form network-form"
      onSubmit={() => void formik.submitForm()}
    >
      <NetworkFormMenu
        active={section}
        setActive={setSection}
        formik={formik}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          {section === MAIN_CONFIGURATION && (
            <React.Fragment>
              <Select
                {...getFormProps("type")}
                label="Type"
                help="Bridge (FAN) is only available on ubuntu, OVN needs to be configured to be available, Macvlan,  SR-IOV and Physical not available in the UI"
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
                  {
                    label: "Macvlan",
                    value: "macvlan",
                    disabled: true,
                  },
                  {
                    label: "SR-IOV",
                    value: "sriov",
                    disabled: true,
                  },
                  {
                    label: "Physical",
                    value: "physical",
                    disabled: true,
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
                    formik.setFieldValue("ipv4_nat_order", undefined);
                    formik.setFieldValue("ipv4_ovn_ranges", undefined);
                    formik.setFieldValue("ipv6_dhcp_expiry", undefined);
                    formik.setFieldValue("ipv6_dhcp_ranges", undefined);
                    formik.setFieldValue("ipv6_nat_order", undefined);
                    formik.setFieldValue("ipv6_ovn_ranges", undefined);
                    formik.setFieldValue("ipv6_ovn_routes", undefined);
                    formik.setFieldValue("ipv6_ovn_routing", undefined);
                  }
                }}
                value={
                  formik.values.type === "bridge"
                    ? `bridge-${formik.values.bridge_mode ?? "standard"}`
                    : formik.values.type
                }
              />
              {formik.values.type === "ovn" && (
                <Select
                  {...getFormProps("network")}
                  label="Uplink"
                  help="Uplink network to use for external network access"
                  options={getNetworkOptions()}
                  required
                />
              )}
              <Input
                {...getFormProps("name")}
                type="text"
                label="Name"
                required
              />
              <Input
                {...getFormProps("description")}
                type="text"
                label="Description"
              />

              <ConfigurationTable
                formik={formik}
                rows={[
                  ...(formik.values.bridge_mode !== "fan"
                    ? [
                        getConfigurationRow({
                          formik: formik,
                          name: "ipv4_address",
                          label: "IPv4 Address",
                          defaultValue: "auto",
                          children: (
                            <IpAddressSelector
                              id="ipv4_address"
                              label="IPv4 Address"
                              address={formik.values.ipv4_address}
                              setAddress={(value) => {
                                formik.setFieldValue("ipv4_address", value);

                                if (value === "none") {
                                  const nullFields = [
                                    "ipv4_nat",
                                    "ipv4_dhcp",
                                    "ipv4_dhcp_expiry",
                                    "ipv4_dhcp_ranges",
                                  ];
                                  nullFields.forEach((field) =>
                                    formik.setFieldValue(field, undefined)
                                  );
                                }
                              }}
                            />
                          ),
                        }),
                      ]
                    : []),

                  ...(formik.values.bridge_mode !== "fan" &&
                  formik.values.ipv4_address !== "none"
                    ? [
                        getConfigurationRow({
                          formik: formik,
                          name: "ipv4_nat",
                          label: "Ipv4 NAT",
                          defaultValue: "",
                          children: (
                            <CheckboxInput
                              {...getFormProps("ipv4_nat")}
                              label="Ipv4 NAT"
                            />
                          ),
                        }),
                      ]
                    : []),

                  ...(formik.values.bridge_mode !== "fan"
                    ? [
                        getConfigurationRow({
                          formik: formik,
                          name: "ipv6_address",
                          label: "IPv6 Address",
                          defaultValue: "auto",
                          children: (
                            <IpAddressSelector
                              id="ipv6_address"
                              label="IPv6 Address"
                              address={formik.values.ipv6_address}
                              setAddress={(value) => {
                                formik.setFieldValue("ipv6_address", value);

                                if (value === "none") {
                                  const nullFields = [
                                    "ipv6_nat",
                                    "ipv6_dhcp",
                                    "ipv6_dhcp_expiry",
                                    "ipv6_dhcp_ranges",
                                    "ipv6_dhcp_stateful",
                                    "ipv6_ovn_ranges",
                                  ];
                                  nullFields.forEach((field) =>
                                    formik.setFieldValue(field, undefined)
                                  );
                                }
                              }}
                            />
                          ),
                        }),
                      ]
                    : []),

                  ...(formik.values.bridge_mode !== "fan" &&
                  formik.values.ipv6_address !== "none"
                    ? [
                        getConfigurationRow({
                          formik: formik,
                          name: "ipv6_nat",
                          label: "Ipv6 NAT",
                          defaultValue: "",
                          children: (
                            <CheckboxInput
                              {...getFormProps("ipv6_nat")}
                              label="Ipv6 NAT"
                            />
                          ),
                        }),
                      ]
                    : []),

                  ...(formik.values.bridge_mode === "fan"
                    ? [
                        getConfigurationRow({
                          formik: formik,
                          name: "fan_overlay_subnet",
                          label: "Fan overlay subnet",
                          defaultValue: "",
                          children: (
                            <Input
                              type="text"
                              help="Subnet to use as the overlay for the FAN (CIDR)"
                            />
                          ),
                        }),
                      ]
                    : []),

                  ...(formik.values.bridge_mode === "fan"
                    ? [
                        getConfigurationRow({
                          formik: formik,
                          name: "fan_underlay_subnet",
                          label: "Fan underlay subnet",
                          defaultValue: "",
                          children: (
                            <Input
                              type="text"
                              help="Subnet to use as the underlay for the FAN (use auto to use default gateway subnet) (CIDR)"
                            />
                          ),
                        }),
                      ]
                    : []),
                ]}
              />
            </React.Fragment>
          )}
          {section === BRIDGE && (
            <>
              <Input
                {...getFormProps("bridge_mtu")}
                type="text"
                label="MTU"
                help="Bridge MTU (default varies if tunnel or fan setup)"
              />
              <Input
                {...getFormProps("bridge_hwaddr")}
                type="text"
                label="Hardware address"
                help="MAC address for the bridge"
              />
              {formik.values.type === "bridge" && (
                <>
                  <Select
                    {...getFormProps("bridge_driver")}
                    label="Bridge Driver"
                    help="Bridge driver: native or openvswitch"
                    options={[
                      {
                        label: "Select option",
                        value: "",
                        disabled: true,
                      },
                      {
                        label: "Native",
                        value: "native",
                      },
                      {
                        label: "Openvswitch",
                        value: "openvswitch",
                      },
                    ]}
                  />
                </>
              )}
            </>
          )}
          {section === DNS && (
            <>
              <Input
                {...getFormProps("dns_domain")}
                type="text"
                label="DNS domain"
                help="Domain to advertise to DHCP clients and use for DNS resolution"
              />
              {formik.values.type === "bridge" && (
                <Select
                  {...getFormProps("dns_mode")}
                  label="DNS mode"
                  help="DNS registration mode: none for no DNS record, managed for LXD-generated static records or dynamic for client-generated records"
                  options={[
                    {
                      label: "Select option",
                      value: "",
                      disabled: true,
                    },
                    {
                      label: "None",
                      value: "none",
                    },
                    {
                      label: "Managed",
                      value: "managed",
                    },
                    {
                      label: "Dynamic",
                      value: "dynamic",
                    },
                  ]}
                />
              )}
              <Textarea
                {...getFormProps("dns_search")}
                label="DNS search"
                help="Full comma-separated domain search list, defaulting to DNS domain value"
                disabled={formik.values.dns_mode === "none"}
              />
            </>
          )}
          {section === IPV4 && (
            <>
              {formik.values.ipv4_address !== "none" && (
                <CheckboxInput
                  {...getFormProps("ipv4_dhcp")}
                  label="IPv4 DHCP"
                />
              )}
              {formik.values.type !== "ovn" &&
                formik.values.ipv4_dhcp === "true" && (
                  <>
                    <Input
                      {...getFormProps("ipv4_dhcp_expiry")}
                      type="text"
                      label="IPv4 DHCP expiry"
                      help="When to expire DHCP leases"
                    />
                    <Textarea
                      {...getFormProps("ipv4_dhcp_ranges")}
                      label="IPv4 DHCP ranges"
                      help="Comma-separated list of IP ranges to use for DHCP (FIRST-LAST format)"
                    />
                  </>
                )}
              {formik.values.type === "ovn" && (
                <CheckboxInput
                  {...getFormProps("ipv4_l3only")}
                  label="IPv4 L3 only"
                />
              )}
              {formik.values.ipv4_nat === "true" && (
                <>
                  <Input
                    {...getFormProps("ipv4_nat_address")}
                    type="text"
                    label="IPv4 NAT address"
                    help="The source address used for outbound traffic from the bridge"
                  />
                  {formik.values.type !== "ovn" && (
                    <Select
                      {...getFormProps("ipv4_nat_order")}
                      label="IPv4 NAT order"
                      help="Whether to add the required NAT rules before or after any pre-existing rules"
                      options={[
                        {
                          label: "Select option",
                          value: "",
                          disabled: true,
                        },
                        {
                          label: "Before",
                          value: "before",
                        },
                        {
                          label: "After",
                          value: "after",
                        },
                      ]}
                    />
                  )}
                </>
              )}
              {formik.values.type !== "ovn" &&
                formik.values.bridge_mode !== "fan" && (
                  <>
                    <Textarea
                      {...getFormProps("ipv4_ovn_ranges")}
                      label="IPv4 OVN ranges"
                      help="Comma-separated list of IPv4 ranges to use for child OVN network routers (FIRST-LAST format)"
                    />
                  </>
                )}
            </>
          )}
          {section === IPV6 && (
            <>
              {formik.values.ipv6_address !== "none" && (
                <CheckboxInput
                  {...getFormProps("ipv6_dhcp")}
                  label="IPv6 DHCP"
                />
              )}
              {formik.values.ipv6_dhcp === "true" && (
                <>
                  {formik.values.type !== "ovn" && (
                    <>
                      <Input
                        {...getFormProps("ipv6_dhcp_expiry")}
                        type="text"
                        label="IPv6 DHCP expiry"
                        help="When to expire DHCP leases"
                      />
                      <Textarea
                        {...getFormProps("ipv6_dhcp_ranges")}
                        label="IPv6 DHCP ranges"
                        help="Comma-separated list of IPv6 ranges to use for DHCP (FIRST-LAST format)"
                      />
                    </>
                  )}
                  <CheckboxInput
                    {...getFormProps("ipv6_dhcp_stateful")}
                    label="IPv6 DHCP stateful"
                  />
                </>
              )}
              {formik.values.type === "ovn" && (
                <CheckboxInput
                  {...getFormProps("ipv6_l3only")}
                  label="IPv6 L3 only"
                />
              )}
              {formik.values.ipv6_nat === "true" && (
                <>
                  <Input
                    {...getFormProps("ipv6_nat_address")}
                    type="text"
                    label="IPv6 NAT address"
                    help="The source address used for outbound traffic from the bridge"
                  />
                  {formik.values.type !== "ovn" && (
                    <Select
                      {...getFormProps("ipv6_nat_order")}
                      label="IPv6 NAT order"
                      help="Whether to add the required NAT rules before or after any pre-existing rules"
                      options={[
                        {
                          label: "Select option",
                          value: "",
                          disabled: true,
                        },
                        {
                          label: "Before",
                          value: "before",
                        },
                        {
                          label: "After",
                          value: "after",
                        },
                      ]}
                    />
                  )}
                </>
              )}
              {formik.values.type !== "ovn" && (
                <>
                  <Textarea
                    {...getFormProps("ipv6_ovn_ranges")}
                    label="IPv6 OVN ranges"
                    help="Comma-separated list of IPv6 ranges to use for child OVN network routers (FIRST-LAST format)"
                  />
                </>
              )}
            </>
          )}
          {section === YAML_CONFIGURATION && (
            <YamlForm
              yaml={getYaml()}
              setYaml={(yaml) => formik.setFieldValue("yaml", yaml)}
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
