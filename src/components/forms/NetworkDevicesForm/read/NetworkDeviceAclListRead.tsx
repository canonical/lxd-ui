import ExpandableList from "components/ExpandableList";
import ResourceLink from "components/ResourceLink";
import type { FC } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import { getDeviceAcls } from "util/devices";
import { combineAcls, getNetworkAcls } from "util/networks";
import classnames from "classnames";

interface Props {
  project: string;
  network?: LxdNetwork;
  device: LxdNicDevice | null;
  isOverridden?: boolean;
}

const NetworkDeviceAclListRead: FC<Props> = ({
  project,
  network,
  device,
  isOverridden,
}) => {
  const networkAcls = getNetworkAcls(network);
  const deviceAcls = getDeviceAcls(device);
  const allAcls = combineAcls(networkAcls, deviceAcls);

  if (!allAcls.length) return null;

  return (
    <>
      <div
        className={classnames("acl-label", {
          "u-text--muted": isOverridden,
          "u-text--line-through": isOverridden,
        })}
      >
        ACLs
      </div>
      <ExpandableList
        items={allAcls.map((acl) => (
          <ResourceLink
            key={acl}
            type="network-acl"
            value={acl}
            to={`/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl)}`}
            className={classnames("acl-chip", {
              "u-text--line-through": isOverridden,
            })}
          />
        ))}
      />
    </>
  );
};

export default NetworkDeviceAclListRead;
