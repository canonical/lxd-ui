import { type FC } from "react";
import UsedByItem from "./UsedByItem";
import ExpandableList from "./ExpandableList";
import { filterUsedByType, getLinkTarget } from "util/usedBy";
import { pluralize } from "util/instanceBulkActions";
import type { ResourceIconType } from "components/ResourceIcon";
import { capitalizeFirstLetter } from "util/helpers";
import ResourceIcon from "components/ResourceIcon";
import { useCurrentProject } from "context/useCurrentProject";
import type { ResourceType } from "util/resourceDetails";

interface Props {
  entityType: ResourceType;
  usedBy: string[] | undefined;
}

const UsedByRow: FC<Props> = ({ entityType, usedBy }) => {
  if (!usedBy) return null;

  const { project } = useCurrentProject();

  const filteredResources = filterUsedByType(entityType, usedBy);

  const entityNameSingular =
    entityType === "volume"
      ? "Custom volume"
      : capitalizeFirstLetter(entityType.replaceAll("-", " "));
  const entityName = pluralize(entityNameSingular, filteredResources.length);

  return (
    <tr className="used-by-row">
      <th className="u-text--muted used-by-row-header">
        <ResourceIcon type={entityType as ResourceIconType} className="icon" />
        {entityName} ({filteredResources.length})
      </th>
      <td>
        <ExpandableList
          items={filteredResources.map((item) => {
            return (
              <UsedByItem
                key={`${item.name}-${item.project}-${item.target ?? ""}`}
                item={item}
                activeProject={project?.name || "default"}
                type={entityType as ResourceIconType}
                to={getLinkTarget(item, entityType)}
              />
            );
          })}
        />
      </td>
    </tr>
  );
};

export default UsedByRow;
