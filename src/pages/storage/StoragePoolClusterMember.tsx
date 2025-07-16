import ResourceLink from "components/ResourceLink";
import { useClusterMembers } from "context/useClusterMembers";
import type { FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { isClusterLocalDriver } from "util/storagePool";

interface Props {
  pool: LxdStoragePool;
}

export const StoragePoolClusterMember: FC<Props> = ({ pool }) => {
  const isClusterLocal = isClusterLocalDriver(pool.driver);
  const { data: clusterMembers = [] } = useClusterMembers();

  return (
    <div>
      {isClusterLocal ? (
        clusterMembers.map((member) => {
          return (
            <div className="clustered-resource-link" key={member.server_name}>
              <ResourceLink
                type="cluster-member"
                value={member.server_name}
                to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
              />
            </div>
          );
        })
      ) : (
        <ResourceLink
          to="/ui/cluster/members"
          type="cluster-group"
          value="Cluster wide"
        />
      )}
    </div>
  );
};
