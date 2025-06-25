import type { FC } from "react";
import ExpandableList from "components/ExpandableList";
import type { LxdClusterLink } from "types/cluster";
import { Icon } from "@canonical/react-components";

interface Props {
  clusterLink: LxdClusterLink;
}

const ClusterLinkAddresses: FC<Props> = ({ clusterLink }) => {
  const addresses = clusterLink.config["volatile.addresses"];
  if (!addresses || addresses === "") {
    return null;
  }

  return (
    <ExpandableList
      items={
        addresses.split(",").map((address) => {
          return (
            <div key={address}>
              <a
                href={`https://${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {address}
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </div>
          );
        }) ?? []
      }
    />
  );
};

export default ClusterLinkAddresses;
