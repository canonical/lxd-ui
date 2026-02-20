import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import { RichTooltipTable } from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { useNetwork } from "context/useNetworks";
import { Link } from "react-router";
import TruncatedList from "components/TruncatedList";
import ResourceLink from "components/ResourceLink";
import { typesWithAcls } from "util/networks";
import { useNetworkState } from "context/useNetworks";
import { humanFileSize } from "util/helpers";
import { NetworkParentTooltipRow } from "./NetworkParentTooltipRow";
import { ROOT_PATH } from "util/rootPath";

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
  const vlanid = network?.config.vlan || "-";
  const mtu = network?.config.mtu || "-";
  const { counters } = networkState ?? {};

  const rows: TooltipRow[] = [
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

  if (
    network?.managed &&
    (network?.type === "bridge" || network?.type === "ovn")
  ) {
    rows.push({ title: "IPV4", value: ipv4 }, { title: "IPV6", value: ipv6 });
  } else {
    rows.push(
      {
        title: "Parent",
        value: network && (
          <NetworkParentTooltipRow network={network} project={projectName} />
        ),
      },
      { title: "VLAN ID", value: vlanid },
    );
  }

  if (typesWithAcls.includes(network?.type ?? "")) {
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
                    to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/network-acl/${encodeURIComponent(acl)}`}
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
  rows.push(getTypeSpecificRow());

  rows.push({
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
  });

  rows.push({
    title: "Used by",
    value: network?.used_by?.length || 0,
  });

  return (
    <RichTooltipTable rows={rows} className="profile-rich-tooltip-table" />
  );
};

export default NetworkRichTooltip;
