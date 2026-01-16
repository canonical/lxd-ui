import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import {
  LARGE_TOOLTIP_BREAKPOINT,
  MEDIUM_TOOLTIP_BREAKPOINT,
  RichTooltipTable,
} from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useNetwork } from "context/useNetworks";
import { Link } from "react-router";
import TruncatedList from "components/TruncatedList";
import ResourceLink from "components/ResourceLink";
import { typesWithAcls } from "util/networks";
import { useNetworkState } from "context/useNetworks";
import { humanFileSize } from "util/helpers";
import { NetworkParentTooltipRow } from "./NetworkParentTooltipRow";

interface Props {
  networkName: string;
  projectName: string;
  networkUrl: string;
  clusterMember?: string;
}

const NetworkRichTooltip: FC<Props> = ({
  networkName,
  projectName,
  networkUrl,
  clusterMember,
}) => {
  const {
    data: network,
    isLoading: isNetworkLoading,
    error: networkError,
  } = useNetwork(networkName, projectName, clusterMember);
  const { data: networkState } = useNetworkState(
    networkName,
    projectName,
    clusterMember,
    !isNetworkLoading || !networkError,
  );

  const isAboveMedium = !useIsScreenBelow(MEDIUM_TOOLTIP_BREAKPOINT, "height");
  const isAboveLarge = !useIsScreenBelow(LARGE_TOOLTIP_BREAKPOINT, "height");

  if (!network && !isNetworkLoading) {
    return (
      <>
        Network <ResourceLabel type="network" value={networkName} bold /> not
        found
      </>
    );
  }

  const networkDescription = network?.description || "-";
  const networkAcls = network?.config["security.acls"]?.split(",");
  const ipv4 = network?.config["ipv4.address"] || "-";
  const ipv6 = network?.config["ipv6.address"] || "-";
  const networkUsedbyCount = network?.used_by?.length || 0;
  const vlanid = network?.config.vlan || "-";
  const mtu = network?.config.mtu || "-";

  const getSmallScreenRows = (): TooltipRow[] => {
    return [
      {
        title: "Network",
        value: network ? (
          <Link to={networkUrl} title={networkName}>
            {networkName}
          </Link>
        ) : (
          <Spinner />
        ),
        valueTitle: networkName,
      },
      {
        title: "Description",
        value: networkDescription,
        valueTitle: networkDescription,
      },
      {
        title: "State",
        value: networkState?.state || "-",
      },
      {
        title: "Type",
        value: network?.type || "-",
      },
    ];
  };

  const getMediumScreenRows = (): TooltipRow[] => {
    if (!network) {
      return Array(3).fill({ title: "-", value: "-" }) as TooltipRow[];
    }

    const rows: TooltipRow[] = [];

    if (
      network.managed &&
      (network.type === "bridge" || network.type === "ovn")
    ) {
      rows.push({ title: "IPV4", value: ipv4 }, { title: "IPV6", value: ipv6 });
    } else {
      rows.push(
        {
          title: "Parent",
          value: (
            <NetworkParentTooltipRow network={network} project={projectName} />
          ),
        },
        { title: "VLAN ID", value: vlanid },
      );
    }

    if (typesWithAcls.includes(network.type)) {
      rows.push({
        title: "ACLs",
        value: (
          <TruncatedList
            items={
              networkAcls
                ? networkAcls.map((acl) => (
                    <ResourceLink
                      key={acl}
                      type="network-acl"
                      value={acl}
                      to={`/ui/project/${encodeURIComponent(projectName)}/network-acl/${encodeURIComponent(acl)}`}
                    />
                  ))
                : [<>-</>]
            }
          />
        ),
      });
    } else {
      rows.push({ title: "MTU", value: mtu });
    }

    return rows;
  };

  const getLargeScreenRows = (): TooltipRow[] => {
    const { counters } = networkState ?? {};

    return [
      getTypeSpecificRow(),
      {
        title: "Statistics",
        value: (
          <>
            <div className="general-field-label">
              RX: {humanFileSize(counters?.bytes_received ?? 0)} (
              {counters?.packets_received ?? 0} packets)
            </div>
            <div className="general-field-label">
              TX: {humanFileSize(counters?.bytes_sent ?? 0)} (
              {counters?.packets_sent ?? 0} packets)
            </div>
          </>
        ),
      },
      {
        title: "Used by",
        value: networkUsedbyCount,
      },
    ];
  };

  const getTypeSpecificRow = (): TooltipRow => {
    if (!network) return { title: "-", value: "-" };

    const typeRowMap: Record<string, TooltipRow> = {
      bridge: { title: "MTU", value: mtu },
      ovn: { title: "Uplink", value: network.config.network || "-" },
      macvlan: {
        title: "GVRP registration",
        value: network.config.gvrp || "-",
      },
      physical: {
        title: "OVN ingress",
        value: network.config["ovn.ingress_mode"] || "-",
      },
    };

    return typeRowMap[network.type] || { title: "-", value: "-" };
  };

  const rows = getSmallScreenRows();

  if (isAboveMedium) {
    rows.push(...getMediumScreenRows());
  }

  if (isAboveLarge) {
    rows.push(...getLargeScreenRows());
  }
  return (
    <RichTooltipTable rows={rows} className="profile-rich-tooltip-table" />
  );
};

export default NetworkRichTooltip;
