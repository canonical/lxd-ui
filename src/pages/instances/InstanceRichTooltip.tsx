import { type FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import InstanceStatusIcon from "pages/instances/InstanceStatusIcon";
import { useInstance } from "context/useInstances";
import { Spinner } from "@canonical/react-components";
import { getIpAddresses, sortIpv6Addresses } from "util/networks";
import type { IpFamily, LxdInstance } from "types/instance";
import { getInstanceMacAddresses, getInstanceType } from "util/instances";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { isoTimeToString } from "util/helpers";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { type TooltipRow } from "../../components/RichTooltipRow";
import {
  LARGE_TOOLTIP_BREAKPOINT,
  MEDIUM_TOOLTIP_BREAKPOINT,
  RichTooltipTable,
} from "../../components/RichTooltipTable";
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
  const showAddresses = !useIsScreenBelow(MEDIUM_TOOLTIP_BREAKPOINT, "height");
  const showDateTimes = !useIsScreenBelow(LARGE_TOOLTIP_BREAKPOINT, "height");
  if (!instance && !isLoading) {
    return <></>;
  }

  const ipv4Addresses = instance ? getAddresses(instance, "inet") : [];
  const ipv6Addresses = instance ? getAddresses(instance, "inet6") : [];
  const macAddresses = instance ? getInstanceMacAddresses(instance) : [];

  const instanceDescription = instance ? instance.description || "-" : "-";

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
  ];

  if (showAddresses) {
    rows.push(
      {
        title: "IPV4",
        value: ipv4Addresses.length ? (
          <TruncatedList items={ipv4Addresses} numberToShow={1} />
        ) : (
          "-"
        ),
      },
      {
        title: "IPV6",
        value: ipv6Addresses.length ? (
          <TruncatedList items={ipv6Addresses} numberToShow={1} />
        ) : (
          "-"
        ),
      },
      {
        title: "MAC addresses",
        value: instance ? (
          <TruncatedList items={macAddresses} numberToShow={1} />
        ) : (
          "-"
        ),
      },
    );
  }

  if (showDateTimes) {
    rows.push(
      {
        title: "Created",
        value: instance ? isoTimeToString(instance.created_at) : "-",
      },
      {
        title: "Last used",
        value: instance ? isoTimeToString(instance.last_used_at) : "-",
      },
    );
  }

  return (
    <RichTooltipTable rows={rows} className="instance-rich-tooltip-table" />
  );
};
