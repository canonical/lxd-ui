import { type FC } from "react";

import type { LxdClusterLink } from "types/cluster";
import UsedByRow from "components/UsedByRow";
import ExpandableList from "components/ExpandableList";
import { pluralize } from "util/helpers";
import DsIcon from "components/DsIcon";

interface Props {
  clusterLink: LxdClusterLink;
}

const ClusterLinkUsedBy: FC<Props> = ({ clusterLink }) => {
  if (!clusterLink.used_by?.length) {
    return null;
  }

  const otherPaths = clusterLink.used_by.filter(
    (path) => !path.includes("/1.0/replicators/"),
  );

  return (
    <table className="p-main-table delete-cluster-link-table">
      <tbody>
        <UsedByRow entityType="replicator" usedBy={clusterLink.used_by} />
        {otherPaths.length > 0 && (
          <tr className="used-by-row">
            <th className="u-text--muted used-by-row-header">
              <DsIcon icon="units" className="icon" />
              {pluralize("Other", otherPaths.length)} ({otherPaths.length})
            </th>
            <td>
              <ExpandableList
                items={otherPaths.map((path) => (
                  <div key={path}>{path}</div>
                ))}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ClusterLinkUsedBy;
