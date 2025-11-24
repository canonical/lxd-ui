import type { FC } from "react";
import type { LxdNetworkAcl } from "types/network";
import { useParams } from "react-router-dom";
import UsedByRow from "components/UsedByRow";

interface Props {
  networkAcl: LxdNetworkAcl;
}

const NetworkAclUsedBy: FC<Props> = ({ networkAcl }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return null;
  }

  return (
    <table className="network-acl-used-by-table">
      <tbody>
        <UsedByRow entityType="instance" usedBy={networkAcl.used_by} />
        <UsedByRow entityType="profile" usedBy={networkAcl.used_by} />
        <UsedByRow entityType="network" usedBy={networkAcl.used_by} />
      </tbody>
    </table>
  );
};

export default NetworkAclUsedBy;
