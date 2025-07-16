import type { FC } from "react";
import { useEffect, useState } from "react";
import { Form, Input, SearchBox, useNotify } from "@canonical/react-components";
import type {
  LxdNetwork,
  LxdNetworkBridgeDriver,
  LxdNetworkConfig,
  LxdNetworkDnsMode,
  LxdNetworkType,
} from "types/network";
import NetworkFormMenu, {
  BRIDGE,
  IPV4,
  IPV6,
  GENERAL,
  OVN,
  YAML_CONFIGURATION,
  DNS,
} from "pages/networks/forms/NetworkFormMenu";
import type { FormikProps } from "formik/dist/types";
import YamlForm from "components/forms/YamlForm";
import NetworkFormMain from "pages/networks/forms/NetworkFormMain";
import NetworkFormBridge from "pages/networks/forms/NetworkFormBridge";
import NetworkFormDns from "pages/networks/forms/NetworkFormDns";
import NetworkFormIpv4 from "pages/networks/forms/NetworkFormIpv4";
import NetworkFormIpv6 from "pages/networks/forms/NetworkFormIpv6";
import { slugify } from "util/slugify";
import { useDocs } from "context/useDocs";
import { getHandledNetworkConfigKeys, getNetworkKey } from "util/networks";
import NetworkFormOvn from "pages/networks/forms/NetworkFormOvn";
import YamlNotification from "components/forms/YamlNotification";
import { ensureEditMode } from "util/instanceEdit";
import ScrollableContainer from "components/ScrollableContainer";
import NetworkTopology from "pages/networks/NetworkTopology";
import { debounce } from "util/debounce";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import type { LxdClusterMember } from "types/cluster";
import { useIsClustered } from "context/useIsClustered";
import {
  typesWithParent,
  macvlanType,
  ovnType,
  physicalType,
  sriovType,
} from "util/networks";
import { getFirstVisibleSection } from "util/scroll";

export interface NetworkFormValues {
  readOnly: boolean;
  isCreating: boolean;
  name: string;
  description?: string;
  networkType: LxdNetworkType;
  bridge_driver?: LxdNetworkBridgeDriver;
  bridge_external_interfaces?: string;
  bridge_external_interfaces_per_member?: ClusterSpecificValues;
  bridge_hwaddr?: string;
  bridge_mtu?: string;
  dns_domain?: string;
  dns_mode?: LxdNetworkDnsMode;
  dns_nameservers?: string;
  dns_search?: string;
  gvrp?: string;
  ipv4_address?: string;
  ipv4_dhcp?: string;
  ipv4_dhcp_expiry?: string;
  ipv4_dhcp_ranges?: string;
  ipv4_l3only?: string;
  ipv4_nat?: string;
  ipv4_nat_address?: string;
  ipv4_ovn_ranges?: string;
  ipv4_gateway?: string;
  ipv4_routes?: string;
  ipv4_routes_anycast?: string;
  ipv6_address?: string;
  ipv6_dhcp?: string;
  ipv6_dhcp_expiry?: string;
  ipv6_dhcp_ranges?: string;
  ipv6_dhcp_stateful?: string;
  ipv6_l3only?: string;
  ipv6_nat?: string;
  ipv6_nat_address?: string;
  ipv6_ovn_ranges?: string;
  ipv6_gateway?: string;
  ipv6_routes?: string;
  ipv6_routes_anycast?: string;
  mtu?: string;
  network?: string;
  ovn_ingress_mode?: string;
  parent?: string;
  parentPerClusterMember?: ClusterSpecificValues;
  security_acls: string[];
  vlan?: string;
  yaml?: string;
  entityType: "network";
  bareNetwork?: LxdNetwork;
  editRestriction?: string;
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

  const excludeConfigKeys = getHandledNetworkConfigKeys();
  const missingConfigFields = Object.fromEntries(
    Object.entries(values.bareNetwork?.config ?? {}).filter(
      (e) => !excludeConfigKeys.has(e[0] as keyof LxdNetworkConfig),
    ),
  );

  return {
    ...missingMainFields,
    name: values.name,
    description: values.description,
    type: values.networkType,
    config: {
      ...missingConfigFields,
      [getNetworkKey("bridge_driver")]: values.bridge_driver,
      [getNetworkKey("bridge_external_interfaces")]:
        Object.keys(values.bridge_external_interfaces_per_member ?? {})
          .length === 0
          ? values.bridge_external_interfaces
          : undefined,
      [getNetworkKey("bridge_hwaddr")]: values.bridge_hwaddr,
      [getNetworkKey("bridge_mtu")]: values.bridge_mtu,
      [getNetworkKey("dns_domain")]: values.dns_domain,
      [getNetworkKey("dns_mode")]: values.dns_mode,
      [getNetworkKey("dns_nameservers")]: values.dns_nameservers,
      [getNetworkKey("dns_search")]: values.dns_search,
      [getNetworkKey("gvrp")]: values.gvrp,
      [getNetworkKey("ipv4_address")]: values.ipv4_address,
      [getNetworkKey("ipv4_dhcp")]: values.ipv4_dhcp,
      [getNetworkKey("ipv4_dhcp_expiry")]: values.ipv4_dhcp_expiry,
      [getNetworkKey("ipv4_dhcp_ranges")]: values.ipv4_dhcp_ranges,
      [getNetworkKey("ipv4_l3only")]: values.ipv4_l3only,
      [getNetworkKey("ipv4_nat")]: values.ipv4_nat,
      [getNetworkKey("ipv4_nat_address")]: values.ipv4_nat_address,
      [getNetworkKey("ipv4_ovn_ranges")]: values.ipv4_ovn_ranges,
      [getNetworkKey("ipv4_gateway")]: values.ipv4_gateway,
      [getNetworkKey("ipv4_routes")]: values.ipv4_routes,
      [getNetworkKey("ipv4_routes_anycast")]: values.ipv4_routes_anycast,
      [getNetworkKey("ipv6_address")]: values.ipv6_address,
      [getNetworkKey("ipv6_dhcp")]: values.ipv6_dhcp,
      [getNetworkKey("ipv6_dhcp_expiry")]: values.ipv6_dhcp_expiry,
      [getNetworkKey("ipv6_dhcp_ranges")]: values.ipv6_dhcp_ranges,
      [getNetworkKey("ipv6_dhcp_stateful")]: values.ipv6_dhcp_stateful,
      [getNetworkKey("ipv6_l3only")]: values.ipv6_l3only,
      [getNetworkKey("ipv6_nat")]: values.ipv6_nat,
      [getNetworkKey("ipv6_nat_address")]: values.ipv6_nat_address,
      [getNetworkKey("ipv6_ovn_ranges")]: values.ipv6_ovn_ranges,
      [getNetworkKey("ipv6_gateway")]: values.ipv6_gateway,
      [getNetworkKey("ipv6_routes")]: values.ipv6_routes,
      [getNetworkKey("ipv6_routes_anycast")]: values.ipv6_routes_anycast,
      [getNetworkKey("mtu")]: values.mtu ? values.mtu.toString() : undefined,
      [getNetworkKey("network")]: values.network,
      [getNetworkKey("ovn_ingress_mode")]: values.ovn_ingress_mode,
      [getNetworkKey("parent")]: values.parent,
      [getNetworkKey("security_acls")]:
        values.security_acls.length > 0
          ? values.security_acls.join(",")
          : undefined,
      [getNetworkKey("vlan")]: values.vlan ? values.vlan.toString() : undefined,
    },
  };
};

export const isNetworkFormInvalid = (
  formik: FormikProps<NetworkFormValues>,
  clusterMembers: LxdClusterMember[],
) => {
  return (
    !formik.isValid ||
    !formik.values.name ||
    (formik.values.networkType === ovnType && !formik.values.network) ||
    (typesWithParent.includes(formik.values.networkType) &&
      !formik.values.parent &&
      Object.values(formik.values.parentPerClusterMember ?? {}).filter(
        (item) => item.length > 0,
      ).length !== clusterMembers.length)
  );
};

interface Props {
  formik: FormikProps<NetworkFormValues>;
  getYaml: () => string;
  project: string;
  section: string;
  setSection: (section: string, source: "click" | "scroll") => void;
  version?: number;
}

const NetworkForm: FC<Props> = ({
  formik,
  getYaml,
  project,
  section,
  setSection,
  version = 0,
}) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const isClustered = useIsClustered();
  const [query, setQuery] = useState("");
  const [hasEmptySearchResult, setEmptySearchResult] = useState(false);

  const filterRows = (rows: MainTableRow[]) => {
    if (!query) {
      return rows;
    }
    const filteredRows = rows.filter((row) => {
      return row.name?.toString()?.toLowerCase().includes(query);
    });
    if (filteredRows.length > 0) {
      setEmptySearchResult(false);
    }
    return filteredRows;
  };

  const isManageed = formik.values.bareNetwork?.managed ?? true;

  // see https://documentation.ubuntu.com/lxd/en/latest/reference/networks/
  // for details on available sections per type
  const availableSections = [GENERAL];

  const hasIpV4 = formik.values.ipv4_address !== "none";
  const hasIpV6 = formik.values.ipv6_address !== "none";
  const isMacvlan = formik.values.networkType === macvlanType;
  const isPhysical = formik.values.networkType === physicalType;
  const isSriov = formik.values.networkType === sriovType;

  if (isManageed && !isPhysical && !isMacvlan && !isSriov) {
    availableSections.push(BRIDGE);
  }
  if (isManageed && hasIpV4 && !isMacvlan && !isSriov) {
    availableSections.push(IPV4);
  }
  if (isManageed && hasIpV6 && !isMacvlan && !isSriov) {
    availableSections.push(IPV6);
  }
  if (isManageed && !isMacvlan && !isSriov) {
    availableSections.push(DNS);
  }
  if (isManageed && isPhysical) {
    availableSections.push(OVN);
  }

  useEffect(() => {
    const wrapper = document.getElementById("content-details");

    const activateSectionOnScroll = () => {
      const sections = availableSections.map(slugify);
      const activeSection = getFirstVisibleSection(sections, wrapper);
      setSection(activeSection, "scroll");
    };
    const scrollListener = () => {
      debounce(activateSectionOnScroll, 20);
    };
    wrapper?.addEventListener("scroll", scrollListener);

    return () => wrapper?.removeEventListener("scroll", scrollListener);
  }, [availableSections]);

  const isUnmanagedNetwork = formik.values.bareNetwork?.managed === false;

  return (
    <div className="network-form">
      <ScrollableContainer
        className="contents"
        dependencies={[notify.notification]}
        belowIds={["form-footer", "status-bar"]}
      >
        {!formik.values.isCreating &&
          query.length < 1 &&
          section !== slugify(YAML_CONFIGURATION) && (
            <NetworkTopology
              formik={formik}
              project={project}
              isServerClustered={isClustered}
            />
          )}
        <Form className="sections" onSubmit={formik.handleSubmit}>
          {section !== slugify(YAML_CONFIGURATION) && (
            <>
              {/* hidden submit to enable enter key in inputs */}
              <Input type="submit" hidden value="Hidden input" />
              {query.length < 1 && (
                <NetworkFormMain
                  formik={formik}
                  project={project}
                  isClustered={isClustered}
                  key={`main-${formik.values.bareNetwork?.name}`}
                />
              )}
              {availableSections.includes(BRIDGE) && (
                <NetworkFormBridge
                  formik={formik}
                  filterRows={filterRows}
                  key={`bridge-${formik.values.bareNetwork?.name}`}
                />
              )}
              {availableSections.includes(IPV4) && (
                <NetworkFormIpv4
                  formik={formik}
                  filterRows={filterRows}
                  key={`ipv4-${formik.values.bareNetwork?.name}`}
                />
              )}
              {availableSections.includes(IPV6) && (
                <NetworkFormIpv6
                  formik={formik}
                  filterRows={filterRows}
                  key={`ipv6-${formik.values.bareNetwork?.name}`}
                />
              )}
              {availableSections.includes(DNS) && (
                <NetworkFormDns
                  formik={formik}
                  filterRows={filterRows}
                  key={`dns-${formik.values.bareNetwork?.name}`}
                />
              )}
              {availableSections.includes(OVN) && (
                <NetworkFormOvn
                  formik={formik}
                  filterRows={filterRows}
                  key={`ovn-${formik.values.bareNetwork?.name}`}
                />
              )}
            </>
          )}
          {section === slugify(YAML_CONFIGURATION) && (
            <YamlForm
              key={`yaml-form-${version}`}
              yaml={getYaml()}
              setYaml={(yaml) => {
                ensureEditMode(formik);
                formik.setFieldValue("yaml", yaml);
              }}
              readOnly={!!formik.values.editRestriction || isUnmanagedNetwork}
              readOnlyMessage={
                isUnmanagedNetwork
                  ? "Unmanaged networks are read only"
                  : formik.values.editRestriction
              }
            >
              <YamlNotification
                entity="network"
                href={`${docBaseLink}/explanation/networks/#managed-networks`}
              />
            </YamlForm>
          )}
          {hasEmptySearchResult && (
            <div>No configuration found matching this search.</div>
          )}
        </Form>
      </ScrollableContainer>
      {section !== slugify(YAML_CONFIGURATION) &&
        availableSections.length > 1 && (
          <div className="aside">
            <SearchBox
              onChange={(inputValue) => {
                setQuery(inputValue);
                setEmptySearchResult(true);
              }}
              value={query}
              name="search-setting"
              type="text"
              placeholder="Search for key"
            />
            <NetworkFormMenu
              active={section}
              setActive={(section) => {
                setSection(section, "click");
              }}
              formik={formik}
              availableSections={availableSections}
            />
          </div>
        )}
    </div>
  );
};

export default NetworkForm;
