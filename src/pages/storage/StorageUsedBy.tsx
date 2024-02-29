import { FC } from "react";
import { Link } from "react-router-dom";
import ImageName from "pages/images/ImageName";
import { LxdStoragePool, LxdStorageVolume } from "types/storage";
import { filterUsedByType, LxdUsedBy } from "util/usedBy";
import InstanceLink from "pages/instances/InstanceLink";
import ExpandableList from "components/ExpandableList";

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
    [INSTANCES]: filterUsedByType("instances", storage.used_by),
    [PROFILES]: filterUsedByType("profiles", storage.used_by),
    [IMAGES]: filterUsedByType("images", storage.used_by),
    [SNAPSHOTS]: filterUsedByType("snapshots", storage.used_by),
    [CUSTOM_VOLUMES]: filterUsedByType("volumes", storage.used_by),
  };

  return (
    <table>
      <tbody>
        <tr>
          <th className="p-muted-heading">
            Instances ({data[INSTANCES].length})
          </th>
          <td>
            <ExpandableList
              items={data[INSTANCES].map((item) => (
                <div key={`${item.name}-${item.project}`}>
                  <InstanceLink instance={item} />
                  {item.project !== project && ` (project ${item.project})`}
                </div>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="p-muted-heading">
            Profiles ({data[PROFILES].length})
          </th>
          <td>
            <ExpandableList
              items={data[PROFILES].map((item) => (
                <div key={`${item.name}-${item.project}`}>
                  <Link to={`/ui/project/${item.project}/profile/${item.name}`}>
                    {item.name}
                  </Link>
                  {item.project !== project && ` (project ${item.project})`}
                </div>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="p-muted-heading">Images ({data[IMAGES].length})</th>
          <td>
            <ExpandableList
              items={data[IMAGES].map((item) => (
                <div key={`${item.name}-${item.project}`}>
                  <Link to={`/ui/project/${item.project}/images`}>
                    <ImageName id={item.name} project={item.project} />
                  </Link>
                  {item.project !== project && ` (project ${item.project})`}
                </div>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="p-muted-heading">
            Snapshots ({data[SNAPSHOTS].length})
          </th>
          <td>
            <ExpandableList
              items={data[SNAPSHOTS].map((item) => (
                <>
                  {item.instance && (
                    <div key={`${item.instance}-${item.name}-${item.project}`}>
                      <Link
                        to={`/ui/project/${item.project}/instance/${item.instance}/snapshots`}
                      >
                        {`${item.instance} ${item.name}`}
                      </Link>
                      {item.project !== project && ` (project ${item.project})`}
                    </div>
                  )}
                  {item.volume && (
                    <div
                      key={`${item.volume}-${item.name}-${item.project}-${item.pool}`}
                    >
                      <Link
                        to={`/ui/project/${item.project}/storage/pool/${item.pool}/volumes/custom/${item.volume}/snapshots`}
                      >
                        {`${item.volume} ${item.name}`}
                      </Link>
                      {item.project !== project && ` (project ${item.project})`}
                    </div>
                  )}
                </>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="p-muted-heading">
            Custom volumes ({data[CUSTOM_VOLUMES].length})
          </th>
          <td>
            <ExpandableList
              items={data[CUSTOM_VOLUMES].map((item) => (
                <div key={`${item.name}-${item.project}`}>
                  <Link
                    to={`/ui/project/${item.project}/storage/pool/${storage.name}/volumes/custom/${item.name}`}
                  >
                    {item.name}
                  </Link>
                  {item.project !== project && ` (project ${item.project})`}
                </div>
              ))}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default StorageUsedBy;
