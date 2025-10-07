import ExpandableList from "components/ExpandableList";
import ResourceLink from "components/ResourceLink";
import type { FC } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import { getDeviceAcls } from "util/devices";
import { getNetworkAcls } from "util/networks";

interface Props {
  project: string;
  network?: LxdNetwork;
  device: LxdNicDevice | null;
}

const ReadOnlyAclsList: FC<Props> = ({ project, network, device }) => {
  const networkAcls = getNetworkAcls(network);
  const deviceAcls = getDeviceAcls(device);
  const allAcls = Array.from(new Set(networkAcls.concat(deviceAcls)));

  if (!allAcls.length) return null;

  return (
    <div className="acls-from-network">
      <div>ACLs</div>
      <div>
        <ExpandableList
          items={allAcls.map((acl) => (
            <div key={acl}>
              <ResourceLink
                type="network-acl"
                value={acl}
                to={`/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl)}`}
                className="acl-chip"
              />
            </div>
          ))}
        />
      </div>
    </div>
  );
};

export default ReadOnlyAclsList;
