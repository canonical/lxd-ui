import React, { FC } from "react";
import { Link } from "react-router-dom";
import ImageName from "pages/images/ImageName";
import { LxdStoragePool } from "types/storage";
import { filterUsedByType, LxdUsedBy } from "util/usedBy";
import InstanceLink from "pages/instances/InstanceLink";
import ExpandableList from "components/ExpandableList";

interface Props {
  storage: LxdStoragePool;
  project: string;
}

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const IMAGES = "Images";
const SNAPSHOTS = "Snapshots";
const CUSTOM = "Custom";

const StorageUsedBy: FC<Props> = ({ storage, project }) => {
  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instances", storage.used_by),
    [PROFILES]: filterUsedByType("profiles", storage.used_by),
    [IMAGES]: filterUsedByType("images", storage.used_by),
    [SNAPSHOTS]: filterUsedByType("snapshots", storage.used_by),
    [CUSTOM]: filterUsedByType("storage-pools", storage.used_by),
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
                <div key={item.name}>
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
                <div key={item.name}>
                  <Link
                    to={`/ui/project/${item.project}/profiles/detail/${item.name}`}
                  >
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
                <ImageName
                  key={item.name}
                  id={item.name}
                  project={item.project}
                />
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
                <div key={item.name}>
                  <Link
                    to={`/ui/project/${item.project}/instances/detail/${item.instance}/snapshots`}
                  >
                    {`${item.instance} ${item.name}`}
                  </Link>
                  {item.project !== project && ` (project ${item.project})`}
                </div>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="p-muted-heading">Custom ({data[CUSTOM].length})</th>
          <td>
            <ExpandableList
              items={data[CUSTOM].map((item) => (
                <div key={item.name}>
                  {item.name}
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
