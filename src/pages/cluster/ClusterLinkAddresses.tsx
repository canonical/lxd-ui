import type { FC } from "react";
import ExpandableList from "components/ExpandableList";
import type { LxdClusterLink } from "types/cluster";

interface Props {
  clusterLink: LxdClusterLink;
}

const ClusterLinkAddresses: FC<Props> = ({ clusterLink }) => {
  const addresses = clusterLink.config["volatile.addresses"];
  if (!addresses || addresses === "") {
    return "-";
  }

  return (
    <ExpandableList
      items={
        addresses.split(",").map((address) => {
          return (
            <div key={address} className="u-truncate" title={address}>
              <a
                href={`https://${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {address}
              </a>
            </div>
          );
        }) ?? []
      }
    />
  );
};

export default ClusterLinkAddresses;
