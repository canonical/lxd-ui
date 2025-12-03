import { type FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import InstanceStatusIcon from "pages/instances/InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";
import { useInstance } from "context/useInstances";
import { Spinner } from "@canonical/react-components";
import { getIpAddresses, sortIpv6Addresses } from "util/networks";
import type { IpFamily, LxdInstance } from "types/instance";
import InstanceListAddresses from "pages/instances/InstanceListAddresses";
import { getInstanceMacAddresses } from "util/instances";
import {
  useIsScreenBelow,
  largeScreenBreakpoint,
} from "context/useIsScreenBelow";
import { isoTimeToString } from "util/helpers";

interface Props {
  instanceName: string;
  projectName: string;
}

export const InstanceRichTooltipMessage: FC<Props> = ({
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
  const isLargeScreen = !useIsScreenBelow(largeScreenBreakpoint);

  if (!instance && !isLoading) {
    return <></>;
  }
  const ipv4Addresses = instance ? getAddresses(instance, "inet") : [];
  const ipv6Addresses = instance ? getAddresses(instance, "inet6") : [];
  const macAddresses = instance ? getInstanceMacAddresses(instance) : [];

  return (
    <table className="u-table-layout--auto u-no-margin--bottom instance-rich-tooltip-table">
      <tbody>
        <tr>
          <th className="u-text--muted">Name</th>
          <td title={instance ? instance.name : "-"} className="u-truncate">
            {instance ? <InstanceLink instance={instance} /> : <Spinner />}
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Status</th>
          <td>{instance ? <InstanceStatusIcon instance={instance} /> : "-"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Description</th>
          <td
            title={
              instance && instance.description ? instance.description : "-"
            }
            className="u-truncate"
          >
            {instance && instance.description ? instance.description : "-"}
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Type</th>
          <td>
            {instance
              ? instanceCreationTypes.filter(
                  (item) => item.value === instance.type,
                )[0].label
              : "-"}
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">IPv4</th>
          <td>
            {ipv4Addresses.length ? (
              <InstanceListAddresses addresses={ipv4Addresses} />
            ) : (
              "-"
            )}
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">IPv6</th>
          <td>
            {ipv6Addresses.length ? (
              <InstanceListAddresses addresses={ipv6Addresses} />
            ) : (
              "-"
            )}
          </td>
        </tr>
        {isLargeScreen && (
          <>
            <tr>
              <th className="u-text--muted">MAC addresses</th>
              <td>
                {instance ? (
                  <InstanceListAddresses addresses={macAddresses} />
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Created</th>
              <td>{instance ? isoTimeToString(instance.created_at) : "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted last-used">Last used</th>
              <td>{instance ? isoTimeToString(instance.last_used_at) : "-"}</td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};
