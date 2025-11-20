import type { ResourceType } from "./resourceDetails";
import { extractResourceDetailsFromUrl } from "./resourceDetails";

export interface LxdUsedBy {
  name: string;
  project: string;
  instance?: string;
  volume?: string;
  pool?: string;
  target?: string;
}

/**
 * filter a usedBy path list by a specific type and parse into a LxdUsedBy object list
 *
 * examples for usedByPaths
 * "/1.0/instances/pet-lark"
 * "/1.0/instances/relaxed-basilisk/snapshots/ff?project=foo"
 * "/1.0/profiles/default?project=foo"
 * "/1.0/storage-pools/pool-dir/volumes/custom/test/snapshots/snap1?project=bar"
 * "/1.0/storage-pools/local/volumes/custom/abb?project=robots&target=micro2"
 * "/1.0/images/b5509ae406f49e84faa1fe8e2d78d156b8a79efe00a4d9ea563e865253375db2?project=Penguin-Pen"
 */
export const filterUsedByType = (
  type: ResourceType,
  usedByPaths?: string[],
): LxdUsedBy[] => {
  return (
    usedByPaths
      ?.filter((path) => {
        if (type === "instance" && path.includes("/snapshots/")) {
          return false;
        }

        if (type === "volume" && path.includes("/snapshots/")) {
          return false;
        }

        if (type === "snapshot") {
          return path.includes("/snapshots/");
        }

        if (type === "volume") {
          return path.includes("/volumes/");
        }

        if (type === "bucket") {
          return path.includes("/buckets/");
        }

        if (type === "network-forward") {
          return path.includes("/forwards/");
        }

        return path.startsWith(`/1.0/${type}`);
      })
      .map((path) => {
        const resource = extractResourceDetailsFromUrl(type, path);

        return {
          name: resource.name,
          project: resource.project ?? "default",
          instance: resource.instance,
          volume: resource.volume,
          pool: resource.pool,
          target: resource.target,
        };
      })
      .sort((a, b) => {
        return a.project < b.project
          ? -1
          : a.project > b.project
            ? 1
            : a.name < b.name
              ? -1
              : a.name > b.name
                ? 1
                : 0;
      }) ?? []
  );
};

export const getProfileInstances = (
  project: string,
  isDefaultProject: boolean,
  usedByPaths?: string[],
): LxdUsedBy[] => {
  return filterUsedByType("instance", usedByPaths).filter((instance) => {
    if (isDefaultProject) {
      return true;
    }
    return project === instance.project;
  });
};
