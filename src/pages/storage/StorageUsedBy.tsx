import type { FC } from "react";
import type { LxdStoragePool, LxdStorageVolume } from "types/storage";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import UsedByItem from "components/UsedByItem";
import { getStorageBucketURL } from "util/storageBucket";
import { linkForVolumeDetail } from "util/storageVolume";

interface Props {
  storage: LxdStoragePool | LxdStorageVolume;
  project: string;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const IMAGES = "Images";
const SNAPSHOTS = "Snapshots";
const CUSTOM_VOLUMES = "Custom volumes";
const BUCKETS = "Buckets";

const StorageUsedBy: FC<Props> = ({ storage, project }) => {
  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instance", storage.used_by),
    [PROFILES]: filterUsedByType("profile", storage.used_by),
    [IMAGES]: filterUsedByType("image", storage.used_by),
    [SNAPSHOTS]: filterUsedByType("snapshot", storage.used_by),
    [CUSTOM_VOLUMES]: filterUsedByType("volume", storage.used_by),
    [BUCKETS]: filterUsedByType("bucket", storage.used_by),
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
                  to={`/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.name)}`}
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
                  to={`/ui/project/${encodeURIComponent(item.project)}/profile/${encodeURIComponent(item.name)}`}
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
                  to={`/ui/project/${encodeURIComponent(item.project)}/images`}
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
                      to={`/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.instance)}/snapshots`}
                    />
                  )}
                  {item.volume && (
                    <UsedByItem
                      key={`${item.volume}-${item.name}-${item.project}-${item.target}`}
                      item={item}
                      activeProject={project}
                      type="snapshot"
                      to={`${linkForVolumeDetail({
                        name: item.volume,
                        project: item.project,
                        pool: storage.name,
                        type: "custom",
                        location: item.target ?? "",
                      } as LxdStorageVolume)}/snapshots`}
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
                  key={`${item.name}-${item.project}-${item.target}`}
                  item={item}
                  activeProject={project}
                  type="volume"
                  to={linkForVolumeDetail({
                    name: item.name,
                    project: item.project,
                    pool: storage.name,
                    type: "custom",
                    location: item.target ?? "",
                  } as LxdStorageVolume)}
                />
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Buckets ({data[BUCKETS].length})</th>
          <td>
            <ExpandableList
              items={data[BUCKETS].map((item) => (
                <UsedByItem
                  key={`${item.name}-${item.project}`}
                  item={item}
                  activeProject={project}
                  type="bucket"
                  to={getStorageBucketURL(item.project)}
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
