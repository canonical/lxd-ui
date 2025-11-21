import { type FC } from "react";
import UsedByItem from "./UsedByItem";
import ExpandableList from "./ExpandableList";
import { filterUsedByType } from "util/usedBy";
import { pluralize } from "util/instanceBulkActions";
import type { ResourceIconType } from "components/ResourceIcon";
import { capitalizeFirstLetter } from "util/helpers";
import { linkForVolumeDetail } from "util/storageVolume";
import type { LxdStorageVolume } from "types/storage";
import { getStorageBucketURL } from "util/storageBucket";
import ResourceIcon from "components/ResourceIcon";
import { useCurrentProject } from "context/useCurrentProject";
import type { ResourceType } from "util/resourceDetails";

interface Props {
  entityType: ResourceType;
  usedBy: string[] | undefined;
}

const UsedByRow: FC<Props> = ({ entityType, usedBy }) => {
  if (!usedBy || usedBy.length === 0) return null;

  const { project } = useCurrentProject();

  const lxdUsedBy = filterUsedByType(entityType, usedBy);

  if (lxdUsedBy.length === 0) return null;

  let entityName = pluralize(
    capitalizeFirstLetter(entityType.replaceAll("-", " ")),
    lxdUsedBy.length,
  );

  if (entityType === "volume") {
    entityName = pluralize("Custom volume", lxdUsedBy.length);
  }

  return (
    <tr>
      <th className="u-text--muted used-by-row-header">
        <ResourceIcon type={entityType as ResourceIconType} className="icon" />
        {entityName} ({lxdUsedBy.length})
      </th>
      <td>
        <ExpandableList
          items={lxdUsedBy.map((item) => {
            let to = `/ui/project/${encodeURIComponent(item.project)}/${entityType}/${encodeURIComponent(item.name)}`;
            if (entityType === "snapshot" && item.instance) {
              to = `/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.instance)}/snapshots`;
            } else if (entityType === "snapshot" && item.volume) {
              to = `${linkForVolumeDetail({
                name: item.volume,
                project: item.project,
                pool: item.pool,
                type: "custom",
                location: item.target ?? "",
              } as LxdStorageVolume)}/snapshots`;
            } else if (entityType === "volume") {
              to = linkForVolumeDetail({
                name: item.name,
                project: item.project,
                pool: item.pool,
                type: "custom",
                location: item.target ?? "",
              } as LxdStorageVolume);
            } else if (entityType === "bucket" && item.pool) {
              to = getStorageBucketURL(item.name, item.pool, item.project);
            } else if (entityType === "image") {
              to = `/ui/project/${encodeURIComponent(item.project)}/images`;
            }

            return (
              <UsedByItem
                key={`${item.name}-${item.project}-${item.target ?? ""}`}
                item={item}
                activeProject={project?.name || "default"}
                type={entityType as ResourceIconType}
                to={to}
                itemProject={item.project}
              />
            );
          })}
        />
      </td>
    </tr>
  );
};

export default UsedByRow;
