import ResourceLink from "components/ResourceLink";
import { useClusterMembers } from "context/useClusterMembers";
import type { FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { hasPoolMemberSpecificSize } from "util/storagePool";

interface Props {
  pool: LxdStoragePool;
}

export const StoragePoolClusterMember: FC<Props> = ({ pool }) => {
  const hasMemberSpecificSize = hasPoolMemberSpecificSize(pool.driver);
  const { data: clusterMembers = [] } = useClusterMembers();

  return (
    <div>
      {hasMemberSpecificSize ? (
        clusterMembers.map((member) => {
          return (
            <div className="clustered-resource-link" key={member.server_name}>
              <ResourceLink
                to="/ui/cluster"
                type="cluster-member"
                value={member.server_name}
              />
            </div>
          );
        })
      ) : (
        <ResourceLink
          to="/ui/cluster"
          type="cluster-group"
          value="Cluster wide"
        />
      )}
    </div>
  );
};
