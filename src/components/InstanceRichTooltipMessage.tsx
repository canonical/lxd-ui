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
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { InstanceRichTooltipRow } from "./InstanceRichTooltipRow";
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
  const isLargeScreen = !useIsScreenBelow(largeScreenBreakpoint, "height");

  if (!instance && !isLoading) {
    return <></>;
  }
  const ipv4Addresses = instance ? getAddresses(instance, "inet") : [];
  const ipv6Addresses = instance ? getAddresses(instance, "inet6") : [];
  const macAddresses = instance ? getInstanceMacAddresses(instance) : [];

  return (
    <table className="u-table-layout--auto u-no-margin--bottom instance-rich-tooltip-table">
      <tbody>
        <InstanceRichTooltipRow
          title="Instance"
          value={instance ? <InstanceLink instance={instance} /> : <Spinner />}
          valueTitle={instanceName}
        />
        <InstanceRichTooltipRow
          title="Status"
          value={
            instance ? (
              <>
                <InstanceStatusIcon instance={instance} />
                <InstanceStateActions instance={instance} />
              </>
            ) : (
              "-"
            )
          }
        />
        <InstanceRichTooltipRow
          title="Description"
          value={instance?.description ?? "-"}
          valueTitle={instance?.description}
        />
        <InstanceRichTooltipRow
          title="Type"
          value={
            instance
              ? instanceCreationTypes.filter(
                  (item) => item.value === instance.type,
                )[0].label
              : "-"
          }
        />
        <InstanceRichTooltipRow
          title="IPV4"
          value={
            ipv4Addresses.length ? (
              <InstanceListAddresses
                addresses={ipv4Addresses}
                numberToShow={1}
              />
            ) : (
              "-"
            )
          }
        />
        <InstanceRichTooltipRow
          title="IPV6"
          value={
            ipv6Addresses.length ? (
              <InstanceListAddresses
                addresses={ipv6Addresses}
                numberToShow={1}
              />
            ) : (
              "-"
            )
          }
        />
        <InstanceRichTooltipRow
          title="MAC addresses"
          value={
            instance ? (
              <InstanceListAddresses
                addresses={macAddresses}
                numberToShow={1}
              />
            ) : (
              "-"
            )
          }
        />

        {isLargeScreen && (
          <>
            <InstanceRichTooltipRow
              title="Created"
              value={instance ? isoTimeToString(instance.created_at) : "-"}
            />
            <InstanceRichTooltipRow
              title="Last used"
              value={instance ? isoTimeToString(instance.last_used_at) : "-"}
            />
          </>
        )}
      </tbody>
    </table>
  );
};
