import type { FC } from "react";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import UsedByItem from "components/UsedByItem";
import { useParams } from "react-router-dom";
import type { LxdPlacementGroup } from "types/placementGroup";

interface Props {
  placementGroup?: LxdPlacementGroup;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";

const PlacementGroupUsedBy: FC<Props> = ({ placementGroup }) => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return null;
  }

  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instance", placementGroup?.used_by),
    [PROFILES]: filterUsedByType("profile", placementGroup?.used_by),
  };

  if (data[INSTANCES].length === 0 && data[PROFILES].length === 0) {
    return <p className="u-text--muted">None</p>;
  }

  return (
    <table>
      <tbody>
        {data[INSTANCES].length > 0 && (
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
                    to={`/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.name)}`}
                  />
                ))}
              />
            </td>
          </tr>
        )}
        {data[PROFILES].length > 0 && (
          <tr>
            <th className="u-text--muted">
              Profiles ({data[PROFILES].length})
            </th>
            <td>
              <ExpandableList
                items={data[PROFILES].map((item) => (
                  <UsedByItem
                    key={`${item.name}-${item.project}`}
                    item={item}
                    activeProject={project}
                    type="profile"
                    to={`/ui/project/${encodeURIComponent(item.project)}/profile/${encodeURIComponent(item.name)}`}
                  />
                ))}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PlacementGroupUsedBy;
