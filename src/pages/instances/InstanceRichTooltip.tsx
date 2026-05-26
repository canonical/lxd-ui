import { type FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import InstanceStatusIcon from "pages/instances/InstanceStatusIcon";
import { useInstance } from "context/useInstances";
import { Spinner } from "@canonical/react-components";
import { getIpAddresses, sortIpv6Addresses } from "util/networks";
import type { IpFamily, LxdInstance } from "types/instance";
import { getInstanceMacAddresses, getInstanceType } from "util/instances";
import { isoTimeToString } from "util/helpers";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { type TooltipRow } from "../../components/RichTooltipRow";
import { RichTooltipTable } from "../../components/RichTooltipTable";
import TruncatedList from "components/TruncatedList";

interface Props {
  instanceName: string;
  projectName: string;
}

export const InstanceRichTooltip: FC<Props> = ({
  instanceName,
  projectName,
}) => {
  const getAddresses = (instance: LxdInstance, family: IpFamily) => {
    const addresses = getIpAddresses(instance, family);
    const sortedAddresses =
      family === "inet6" ? sortIpv6Addresses(addresses) : addresses;
    return sortedAddresses.map((item) => item.address);
  };

  const { data: instance, isLoading } = useInstance(instanceName, projectName);
  if (!instance && !isLoading) {
    return <></>;
  }

  const ipv4Addresses = instance ? getAddresses(instance, "inet") : [];
  const ipv6Addresses = instance ? getAddresses(instance, "inet6") : [];
  const macAddresses = instance ? getInstanceMacAddresses(instance) : [];

  const instanceDescription = instance?.description || "-";

  const rows: TooltipRow[] = [
    {
      title: "Status",
      value: instance ? (
        <div className="status-row-content">
          <div className="status-icon">
            <InstanceStatusIcon instance={instance} />
          </div>
          <InstanceStateActions instance={instance} />
        </div>
      ) : (
        "-"
      ),
    },
    {
      title: "Instance",
      value: instance ? <InstanceLink instance={instance} /> : <Spinner />,
      valueTitle: instanceName,
    },
    {
      title: "Description",
      value: instanceDescription,
      valueTitle: instanceDescription,
    },
    {
      title: "Type",
      value: instance ? getInstanceType(instance) : "-",
    },
    {
      title: "IPV4",
      value: ipv4Addresses.length ? (
        <TruncatedList items={ipv4Addresses} />
      ) : (
        "-"
      ),
    },
    {
      title: "IPV6",
      value: ipv6Addresses.length ? (
        <TruncatedList items={ipv6Addresses} />
      ) : (
        "-"
      ),
    },
    {
      title: "MAC addresses",
      value: instance ? <TruncatedList items={macAddresses} /> : "-",
    },
    {
      title: "Created",
      value: instance ? isoTimeToString(instance.created_at) : "-",
    },
    {
      title: "Last used",
      value: instance ? isoTimeToString(instance.last_used_at) : "-",
    },
  ];

  return (
    <RichTooltipTable rows={rows} className="instance-rich-tooltip-table" />
  );
};
