import type { FC } from "react";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import UsedByItem from "components/UsedByItem";
import type { LxdNetworkAcl } from "types/network";
import { useParams } from "react-router-dom";

interface Props {
  networkAcl: LxdNetworkAcl;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const NETWORKS = "Networks";

const NetworkAclUsedBy: FC<Props> = ({ networkAcl }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return null;
  }

  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instance", networkAcl.used_by),
    [PROFILES]: filterUsedByType("profile", networkAcl.used_by),
    [NETWORKS]: filterUsedByType("network", networkAcl.used_by),
  };

  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">
            Instances ({data[INSTANCES].length})
          </th>
          <td>
            <ExpandableList
              items={data[INSTANCES].map((item) => (
                <UsedByItem
                  key={`${item.name}-${item.project}`}
                  item={item}
                  activeProject={project}
                  type="instance"
                  to={`/ui/project/${item.project}/instance/${item.name}`}
                />
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Profiles ({data[PROFILES].length})</th>
          <td>
            <ExpandableList
              items={data[PROFILES].map((item) => (
                <UsedByItem
                  key={`${item.name}-${item.project}`}
                  item={item}
                  activeProject={project}
                  type="profile"
                  to={`/ui/project/${item.project}/profile/${item.name}`}
                />
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Networks ({data[NETWORKS].length})</th>
          <td>
            <ExpandableList
              items={data[NETWORKS].map((item) => (
                <UsedByItem
                  key={`${item.name}-${item.project}`}
                  item={item}
                  activeProject={project}
                  type="network"
                  to={`/ui/project/${item.project}/network/${item.name}`}
                />
              ))}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default NetworkAclUsedBy;
