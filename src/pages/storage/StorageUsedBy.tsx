import { FC } from "react";
import type { LxdStoragePool, LxdStorageVolume } from "types/storage";
import { filterUsedByType, LxdUsedBy } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import UsedByItem from "components/UsedByItem";

interface Props {
  storage: LxdStoragePool | LxdStorageVolume;
  project: string;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const IMAGES = "Images";
const SNAPSHOTS = "Snapshots";
const CUSTOM_VOLUMES = "Custom volumes";

const StorageUsedBy: FC<Props> = ({ storage, project }) => {
  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instance", storage.used_by),
    [PROFILES]: filterUsedByType("profile", storage.used_by),
    [IMAGES]: filterUsedByType("image", storage.used_by),
    [SNAPSHOTS]: filterUsedByType("snapshot", storage.used_by),
    [CUSTOM_VOLUMES]: filterUsedByType("volume", storage.used_by),
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
          <th className="u-text--muted">Images ({data[IMAGES].length})</th>
          <td>
            <ExpandableList
              items={data[IMAGES].map((item) => (
                <UsedByItem
                  key={`${item.name}-${item.project}`}
                  item={item}
                  activeProject={project}
                  type="image"
                  to={`/ui/project/${item.project}/images`}
                />
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">
            Snapshots ({data[SNAPSHOTS].length})
          </th>
          <td>
            <ExpandableList
              items={data[SNAPSHOTS].map((item) => (
                <>
                  {item.instance && (
                    <UsedByItem
                      key={`${item.instance}-${item.name}-${item.project}`}
                      item={item}
                      activeProject={project}
                      type="snapshot"
                      to={`/ui/project/${item.project}/instance/${item.instance}/snapshots`}
                    />
                  )}
                  {item.volume && (
                    <UsedByItem
                      key={`${item.volume}-${item.name}-${item.project}-${item.pool}`}
                      item={item}
                      activeProject={project}
                      type="snapshot"
                      to={`/ui/project/${item.project}/storage/pool/${item.pool}/volumes/custom/${item.volume}/snapshots`}
                    />
                  )}
                </>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">
            Custom volumes ({data[CUSTOM_VOLUMES].length})
          </th>
          <td>
            <ExpandableList
              items={data[CUSTOM_VOLUMES].map((item) => (
                <UsedByItem
                  key={`${item.name}-${item.project}`}
                  item={item}
                  activeProject={project}
                  type="volume"
                  to={`/ui/project/${item.project}/storage/pool/${storage.name}/volumes/custom/${item.name}`}
                />
              ))}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default StorageUsedBy;
